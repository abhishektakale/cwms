import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: string) {
    const query = (q ?? '').trim();
    if (!query) return { query, items: [] };
    const [works, bills, documents, expenses] = await Promise.all([
      this.prisma.work.findMany({
        where: {
          OR: [
            { workCode: { contains: query, mode: 'insensitive' } },
            { workName: { contains: query, mode: 'insensitive' } },
            { workOrderNo: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.bill.findMany({
        where: {
          OR: [
            { systemBillNumber: { contains: query, mode: 'insensitive' } },
            { raBillNo: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.document.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { documentNumber: { contains: query, mode: 'insensitive' } },
            { documentCode: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.expense.findMany({
        where: {
          OR: [
            { expenseCode: { contains: query, mode: 'insensitive' } },
            { vendor: { contains: query, mode: 'insensitive' } },
            { invoiceNo: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
    ]);

    return {
      query,
      items: [
        ...works.map((w) => ({
          entityType: 'Work' as const,
          id: w.id,
          title: w.workName,
          subtitle: w.workCode,
          workId: w.id,
        })),
        ...bills.map((b) => ({
          entityType: 'Bill' as const,
          id: b.id,
          title: b.systemBillNumber,
          subtitle: b.raBillNo ?? undefined,
          workId: b.workId,
        })),
        ...documents.map((d) => ({
          entityType: 'Document' as const,
          id: d.id,
          title: d.title ?? d.documentNumber ?? d.documentCode ?? d.id,
          workId: d.workId,
        })),
        ...expenses.map((e) => ({
          entityType: 'Expense' as const,
          id: e.id,
          title: e.expenseCode ?? e.vendor ?? e.id,
          subtitle: e.description ?? undefined,
          workId: e.workId ?? undefined,
        })),
      ],
    };
  }

  // silence unused if needed
  ensureFound(id: string) {
    if (!id) throw new NotFoundException();
  }
}
