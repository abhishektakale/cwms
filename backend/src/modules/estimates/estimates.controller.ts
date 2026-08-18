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
} from '@nestjs/common';
import * as Prisma from '@prisma/client';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { CurrentUser } from '../../shared/auth/current-user.decorator';
import { RequiresMutate } from '../../shared/auth/roles.decorator';
import { EstimatesService, EstimateWrite } from './estimates.service';

class EstimateBodyDto implements EstimateWrite {
  @IsString()
  @MinLength(1)
  estimateNo!: string;

  @IsDateString()
  estimateDate!: string;

  @IsOptional()
  @IsString()
  revisedEstimate?: string | null;

  @IsOptional()
  @IsString()
  approvedBy?: string | null;

  @IsOptional()
  @IsUUID()
  documentId?: string | null;

  @IsOptional()
  @IsString()
  remarks?: string | null;
}

@Controller()
export class EstimatesController {
  constructor(private readonly estimates: EstimatesService) {}

  @Get('works/:workId/estimates')
  list(@Param('workId', ParseUUIDPipe) workId: string) {
    return this.estimates.listByWork(workId);
  }

  @Post('works/:workId/estimates')
  @RequiresMutate()
  @HttpCode(201)
  create(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Body() body: EstimateBodyDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.estimates.create(workId, body, user);
  }

  @Get('estimates/:estimateId')
  get(@Param('estimateId', ParseUUIDPipe) estimateId: string) {
    return this.estimates.get(estimateId);
  }

  @Patch('estimates/:estimateId')
  @RequiresMutate()
  update(
    @Param('estimateId', ParseUUIDPipe) estimateId: string,
    @Body() body: EstimateBodyDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.estimates.update(estimateId, body, user);
  }

  @Delete('estimates/:estimateId')
  @RequiresMutate()
  @HttpCode(204)
  async remove(
    @Param('estimateId', ParseUUIDPipe) estimateId: string,
    @CurrentUser() user: Prisma.User,
  ): Promise<void> {
    await this.estimates.remove(estimateId, user);
  }
}
