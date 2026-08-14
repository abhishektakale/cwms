import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReportType, User } from '@prisma/client';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { money } from '../../shared/kernel/money.util';

const REPORT_META: Array<{
  reportType: string;
  name: string;
  prisma: ReportType;
}> = [
  {
    reportType: 'work-register',
    name: 'Work Register',
    prisma: ReportType.work_register,
  },
  { reportType: 'billing', name: 'Billing', prisma: ReportType.billing },
  {
    reportType: 'expenditure',
    name: 'Expenditure',
    prisma: ReportType.expenditure,
  },
  {
    reportType: 'financial-summary',
    name: 'Financial Summary',
    prisma: ReportType.financial_summary,
  },
  {
    reportType: 'work-wise-summary',
    name: 'Work-wise Summary',
    prisma: ReportType.work_wise_summary,
  },
  {
    reportType: 'pending-payment',
    name: 'Pending Payment',
    prisma: ReportType.pending_payment,
  },
  {
    reportType: 'document-register',
    name: 'Document Register',
    prisma: ReportType.document_register,
  },
  {
    reportType: 'general-expense',
    name: 'General Expense',
    prisma: ReportType.general_expense,
  },
  {
    reportType: 'dashboard-summary',
    name: 'Dashboard Summary',
    prisma: ReportType.dashboard_summary,
  },
];

function parseReportType(raw: string): { api: string; prisma: ReportType } {
  const found = REPORT_META.find((r) => r.reportType === raw);
  if (!found) {
    throw new BadRequestException({
      title: 'Bad Request',
      status: 400,
      code: 'REPORT_TYPE_INVALID',
      detail: `Unknown report type: ${raw}`,
    });
  }
  return { api: found.reportType, prisma: found.prisma };
}

function cellText(value: unknown): string {
  if (value == null) return '';
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}

function fyRange(filters: Record<string, unknown>): { from?: Date; to?: Date } {
  const fy =
    typeof filters.financialYear === 'string' ? filters.financialYear : null;
  if (!fy) return {};
  const m = /^(\d{4})/.exec(fy);
  if (!m) return {};
  const y = Number(m[1]);
  return { from: new Date(`${y}-04-01`), to: new Date(`${y + 1}-03-31`) };
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  listTypes() {
    return {
      items: REPORT_META.map(({ reportType, name }) => ({ reportType, name })),
    };
  }

  async run(reportType: string, filters: Record<string, unknown> = {}) {
    const { api } = parseReportType(reportType);
    const data = await this.build(api, filters);
    return {
      reportType: api,
      ...data,
      generatedAt: new Date().toISOString(),
      filtersApplied: filters,
    };
  }

  async export(
    reportType: string,
    format: 'pdf' | 'excel',
    filters: Record<string, unknown> = {},
  ) {
    const result = await this.run(reportType, filters);
    if (format === 'excel') {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(result.reportType);
      ws.addRow(result.columns);
      for (const row of result.rows) {
        ws.addRow(
          result.columns.map((c) =>
            cellText((row as Record<string, unknown>)[c]),
          ),
        );
      }
      const buffer = Buffer.from(await wb.xlsx.writeBuffer());
      return {
        buffer,
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileName: `${result.reportType}.xlsx`,
      };
    }

    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 40 });
    doc.on('data', (c: Buffer) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
    doc
      .fontSize(14)
      .text(`CWMS Report: ${result.reportType}`, { underline: true });
    doc.moveDown();
    doc.fontSize(9).text(result.columns.join(' | '));
    doc.moveDown(0.5);
    for (const row of result.rows.slice(0, 200)) {
      doc.text(
        result.columns
          .map((c) => cellText((row as Record<string, unknown>)[c]))
          .join(' | '),
      );
    }
    doc.end();
    const buffer = await done;
    return {
      buffer,
      contentType: 'application/pdf',
      fileName: `${result.reportType}.pdf`,
    };
  }

  async listSaved(reportType: string, user: User) {
    const { prisma } = parseReportType(reportType);
    const rows = await this.prisma.savedReportFilter.findMany({
      where: { userId: user.id, reportType: prisma },
      orderBy: { updatedAt: 'desc' },
    });
    return {
      items: rows.map((r) => ({
        id: r.id,
        reportType,
        name: r.name,
        filters: r.filtersJson as object,
        isDefault: r.isDefault,
        updatedAt: r.updatedAt.toISOString(),
      })),
    };
  }

  async createSaved(
    reportType: string,
    body: { name: string; filters: object; isDefault?: boolean },
    user: User,
  ) {
    const { prisma, api } = parseReportType(reportType);
    if (body.isDefault) {
      await this.prisma.savedReportFilter.updateMany({
        where: { userId: user.id, reportType: prisma, isDefault: true },
        data: { isDefault: false },
      });
    }
    const row = await this.prisma.savedReportFilter.create({
      data: {
        userId: user.id,
        reportType: prisma,
        name: body.name.trim(),
        filtersJson: body.filters,
        isDefault: !!body.isDefault,
      },
    });
    return {
      id: row.id,
      reportType: api,
      name: row.name,
      filters: row.filtersJson as object,
      isDefault: row.isDefault,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updateSaved(
    reportType: string,
    filterId: string,
    body: { name?: string; filters?: object; isDefault?: boolean },
    user: User,
  ) {
    const { prisma, api } = parseReportType(reportType);
    const existing = await this.prisma.savedReportFilter.findFirst({
      where: { id: filterId, userId: user.id, reportType: prisma },
    });
    if (!existing) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'FILTER_NOT_FOUND',
        detail: 'Saved filter not found',
      });
    }
    if (body.isDefault) {
      await this.prisma.savedReportFilter.updateMany({
        where: { userId: user.id, reportType: prisma, isDefault: true },
        data: { isDefault: false },
      });
    }
    const row = await this.prisma.savedReportFilter.update({
      where: { id: filterId },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.filters ? { filtersJson: body.filters } : {}),
        ...(body.isDefault !== undefined ? { isDefault: body.isDefault } : {}),
      },
    });
    return {
      id: row.id,
      reportType: api,
      name: row.name,
      filters: row.filtersJson as object,
      isDefault: row.isDefault,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async deleteSaved(reportType: string, filterId: string, user: User) {
    const { prisma } = parseReportType(reportType);
    const existing = await this.prisma.savedReportFilter.findFirst({
      where: { id: filterId, userId: user.id, reportType: prisma },
    });
    if (!existing) {
      throw new NotFoundException({
        title: 'Not Found',
        status: 404,
        code: 'FILTER_NOT_FOUND',
        detail: 'Saved filter not found',
      });
    }
    await this.prisma.savedReportFilter.delete({ where: { id: filterId } });
  }

  private async build(api: string, filters: Record<string, unknown>) {
    const fy = fyRange(filters);
    switch (api) {
      case 'work-register': {
        const rows = await this.prisma.work.findMany({
          where: {
            ...(typeof filters.status === 'string'
              ? { status: filters.status as never }
              : {}),
            ...(fy.from || fy.to
              ? {
                  workOrderDate: {
                    ...(fy.from ? { gte: fy.from } : {}),
                    ...(fy.to ? { lte: fy.to } : {}),
                  },
                }
              : {}),
          },
          orderBy: { workCode: 'asc' },
        });
        return {
          columns: [
            'workCode',
            'workName',
            'status',
            'totalWorkValue',
            'grossBillsRaised',
            'balanceWorkValue',
          ],
          rows: rows.map((w) => ({
            workCode: w.workCode,
            workName: w.workName,
            status: w.status,
            totalWorkValue: money(w.totalWorkValue),
            grossBillsRaised: money(w.grossBillsRaised),
            balanceWorkValue: money(w.balanceWorkValue),
          })),
        };
      }
      case 'billing': {
        const rows = await this.prisma.bill.findMany({
          include: { work: true },
          where: {
            ...(fy.from || fy.to
              ? {
                  billDate: {
                    ...(fy.from ? { gte: fy.from } : {}),
                    ...(fy.to ? { lte: fy.to } : {}),
                  },
                }
              : {}),
          },
          orderBy: { billDate: 'desc' },
        });
        return {
          columns: [
            'systemBillNumber',
            'workCode',
            'billDate',
            'grossBillAmount',
            'netBillAmount',
            'paymentStatus',
          ],
          rows: rows.map((b) => ({
            systemBillNumber: b.systemBillNumber,
            workCode: b.work.workCode,
            billDate: b.billDate.toISOString().slice(0, 10),
            grossBillAmount: money(b.grossBillAmount),
            netBillAmount: money(b.netBillAmount),
            paymentStatus: b.paymentStatus,
          })),
        };
      }
      case 'expenditure':
      case 'general-expense': {
        const rows = await this.prisma.expense.findMany({
          include: { work: true, expenseHead: true },
          where: {
            ...(api === 'general-expense' ? { expenseType: 'General' } : {}),
            ...(fy.from || fy.to
              ? {
                  expenseDate: {
                    ...(fy.from ? { gte: fy.from } : {}),
                    ...(fy.to ? { lte: fy.to } : {}),
                  },
                }
              : {}),
          },
          orderBy: { expenseDate: 'desc' },
        });
        return {
          columns: [
            'expenseCode',
            'expenseType',
            'workCode',
            'expenseDate',
            'totalAmount',
            'status',
          ],
          rows: rows.map((e) => ({
            expenseCode: e.expenseCode,
            expenseType: e.expenseType,
            workCode: e.work?.workCode ?? '',
            expenseDate: e.expenseDate.toISOString().slice(0, 10),
            totalAmount: money(e.totalAmount),
            status: e.status,
          })),
        };
      }
      case 'pending-payment': {
        const rows = await this.prisma.bill.findMany({
          where: {
            paymentStatus: { in: ['Pending', 'PartiallyReceived'] },
          },
          include: { work: true },
          orderBy: { billDate: 'asc' },
        });
        return {
          columns: [
            'systemBillNumber',
            'workCode',
            'outstandingAmount',
            'paymentStatus',
          ],
          rows: rows.map((b) => ({
            systemBillNumber: b.systemBillNumber,
            workCode: b.work.workCode,
            outstandingAmount: money(b.outstandingAmount),
            paymentStatus: b.paymentStatus,
          })),
        };
      }
      case 'document-register': {
        const rows = await this.prisma.document.findMany({
          include: { work: true, documentType: true, storedFile: true },
          orderBy: { uploadedAt: 'desc' },
        });
        return {
          columns: [
            'documentCode',
            'workCode',
            'documentType',
            'fileName',
            'uploadedAt',
          ],
          rows: rows.map((d) => ({
            documentCode: d.documentCode,
            workCode: d.work.workCode,
            documentType: d.documentType.name,
            fileName: d.storedFile.originalFileName,
            uploadedAt: d.uploadedAt.toISOString(),
          })),
        };
      }
      case 'financial-summary':
      case 'work-wise-summary':
      case 'dashboard-summary': {
        const works = await this.prisma.work.findMany({
          orderBy: { workCode: 'asc' },
        });
        return {
          columns: [
            'workCode',
            'totalWorkValue',
            'grossBillsRaised',
            'paymentsReceived',
            'totalExpenditure',
            'estimatedProfitLoss',
          ],
          rows: works.map((w) => ({
            workCode: w.workCode,
            totalWorkValue: money(w.totalWorkValue),
            grossBillsRaised: money(w.grossBillsRaised),
            paymentsReceived: money(w.paymentsReceived),
            totalExpenditure: money(w.totalExpenditure),
            estimatedProfitLoss: money(w.estimatedProfitLoss),
          })),
          totals: {
            totalWorkValue: money(
              works.reduce(
                (s, w) => s.add(w.totalWorkValue),
                new Prisma.Decimal(0),
              ),
            ),
            grossBillsRaised: money(
              works.reduce(
                (s, w) => s.add(w.grossBillsRaised),
                new Prisma.Decimal(0),
              ),
            ),
          },
        };
      }
      default:
        return { columns: [], rows: [] };
    }
  }
}
