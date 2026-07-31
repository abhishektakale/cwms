import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import * as Prisma from '@prisma/client';
import { ExpenseStatus, ExpenseType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CurrentUser } from '../../shared/auth/current-user.decorator';
import { RequiresMutate } from '../../shared/auth/roles.decorator';
import { ExpensesService, ExpenseWrite } from './expenses.service';

enum ExpenseTypeDto {
  WorkSpecific = 'WorkSpecific',
  General = 'General',
}
enum ExpenseStatusDto {
  Draft = 'Draft',
  Paid = 'Paid',
  AssignedToWork = 'AssignedToWork',
  Cancelled = 'Cancelled',
}
enum PaymentModeDto {
  Cash = 'Cash',
  BankTransfer = 'BankTransfer',
  Cheque = 'Cheque',
  UPI = 'UPI',
}

class ExpenseBodyDto implements ExpenseWrite {
  @IsEnum(ExpenseTypeDto)
  expenseType!: 'WorkSpecific' | 'General';

  @IsOptional()
  @IsUUID()
  workId?: string | null;

  @IsDateString()
  expenseDate!: string;

  @IsUUID()
  expenseHeadId!: string;

  @IsOptional()
  @IsString()
  vendor?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  invoiceNo?: string | null;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string | null;

  @IsString()
  expenseValue!: string;

  @IsString()
  gstPercent!: string;

  @IsOptional()
  @IsEnum(PaymentModeDto)
  paymentMode?: 'Cash' | 'BankTransfer' | 'Cheque' | 'UPI' | null;

  @IsOptional()
  @IsString()
  paymentReference?: string | null;

  @IsOptional()
  @IsDateString()
  paymentDate?: string | null;

  @IsEnum(ExpenseStatusDto)
  status!: 'Draft' | 'Paid' | 'AssignedToWork' | 'Cancelled';
}

class AssignBodyDto {
  @IsUUID()
  workId!: string;
}

@Controller()
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get('expenses')
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('q') q?: string,
    @Query('workId') workId?: string,
    @Query('expenseType') expenseType?: ExpenseType,
    @Query('status') status?: ExpenseStatus,
    @Query('expenseDateFrom') expenseDateFrom?: string,
    @Query('expenseDateTo') expenseDateTo?: string,
  ) {
    return this.expenses.list({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
      q,
      workId,
      expenseType,
      status,
      expenseDateFrom,
      expenseDateTo,
    });
  }

  @Post('expenses')
  @RequiresMutate()
  @HttpCode(201)
  create(@Body() body: ExpenseBodyDto, @CurrentUser() user: Prisma.User) {
    return this.expenses.create(body, user);
  }

  @Get('expenses/:expenseId')
  get(@Param('expenseId', ParseUUIDPipe) expenseId: string) {
    return this.expenses.get(expenseId);
  }

  @Patch('expenses/:expenseId')
  @RequiresMutate()
  update(
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
    @Body() body: ExpenseBodyDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.expenses.update(expenseId, body, user);
  }

  @Delete('expenses/:expenseId')
  @RequiresMutate()
  @HttpCode(204)
  async remove(
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
    @CurrentUser() user: Prisma.User,
  ): Promise<void> {
    await this.expenses.remove(expenseId, user);
  }

  @Post('expenses/:expenseId/assign')
  @RequiresMutate()
  assign(
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
    @Body() body: AssignBodyDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.expenses.assign(expenseId, body.workId, user);
  }

  @Post('expenses/:expenseId/cancel')
  @RequiresMutate()
  cancel(
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.expenses.cancel(expenseId, user);
  }

  @Get('works/:workId/expenses')
  listWork(@Param('workId', ParseUUIDPipe) workId: string) {
    return this.expenses.listByWork(workId);
  }
}
