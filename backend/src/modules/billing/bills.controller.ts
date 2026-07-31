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
import { BillType, PaymentStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CurrentUser } from '../../shared/auth/current-user.decorator';
import { RequiresMutate } from '../../shared/auth/roles.decorator';
import { BillsService, BillWrite } from './bills.service';

enum BillTypeDto {
  RaBill = 'RaBill',
  FinalBill = 'FinalBill',
}
enum PaymentStatusDto {
  Pending = 'Pending',
  PartiallyReceived = 'PartiallyReceived',
  FullyReceived = 'FullyReceived',
}

class OtherDeductionDto {
  @IsString()
  name!: string;

  @IsString()
  amount!: string;

  @IsOptional()
  @IsString()
  kind?: string;
}

class BillBodyDto implements BillWrite {
  @IsUUID()
  workId!: string;

  @IsEnum(BillTypeDto)
  billType!: 'RaBill' | 'FinalBill';

  @IsOptional()
  @IsString()
  raBillNo?: string | null;

  @IsDateString()
  billDate!: string;

  @IsOptional()
  @IsDateString()
  periodFrom?: string | null;

  @IsOptional()
  @IsDateString()
  periodTo?: string | null;

  @IsOptional()
  @IsString()
  previousBillAmount?: string | null;

  @IsString()
  currentWorkPortionAmount!: string;

  @IsString()
  gstAmount!: string;

  @IsOptional()
  @IsObject()
  standardDeductions?: Record<string, string>;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OtherDeductionDto)
  otherDeductions?: OtherDeductionDto[];

  @IsEnum(PaymentStatusDto)
  paymentStatus!: 'Pending' | 'PartiallyReceived' | 'FullyReceived';

  @IsOptional()
  @IsDateString()
  paymentDate?: string | null;

  @IsOptional()
  @IsString()
  amountReceived?: string | null;

  @IsOptional()
  @IsString()
  utrChequeNo?: string | null;

  @IsOptional()
  @IsString()
  bankName?: string | null;

  @IsOptional()
  @IsString()
  remarks?: string | null;
}

@Controller()
export class BillsController {
  constructor(private readonly bills: BillsService) {}

  @Get('bills')
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('q') q?: string,
    @Query('workId') workId?: string,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('billType') billType?: BillType,
    @Query('billDateFrom') billDateFrom?: string,
    @Query('billDateTo') billDateTo?: string,
    @Query('financialYear') financialYear?: string,
    @Query('client') client?: string,
  ) {
    return this.bills.list({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
      q,
      workId,
      paymentStatus,
      billType,
      billDateFrom,
      billDateTo,
      financialYear,
      client,
    });
  }

  @Post('bills')
  @RequiresMutate()
  @HttpCode(201)
  create(@Body() body: BillBodyDto, @CurrentUser() user: Prisma.User) {
    return this.bills.create(body, user);
  }

  @Get('bills/:billId')
  get(@Param('billId', ParseUUIDPipe) billId: string) {
    return this.bills.get(billId);
  }

  @Patch('bills/:billId')
  @RequiresMutate()
  update(
    @Param('billId', ParseUUIDPipe) billId: string,
    @Body() body: BillBodyDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.bills.update(billId, body, user);
  }

  @Delete('bills/:billId')
  @RequiresMutate()
  @HttpCode(204)
  async remove(
    @Param('billId', ParseUUIDPipe) billId: string,
    @CurrentUser() user: Prisma.User,
  ): Promise<void> {
    await this.bills.remove(billId, user);
  }

  @Get('works/:workId/bills')
  listWork(@Param('workId', ParseUUIDPipe) workId: string) {
    return this.bills.listByWork(workId);
  }
}
