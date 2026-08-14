import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import * as Prisma from '@prisma/client';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type { Response } from 'express';
import { CurrentUser } from '../../shared/auth/current-user.decorator';
import { RequiresMutate } from '../../shared/auth/roles.decorator';
import { ReportsService } from './reports.service';

class RunBodyDto {
  @IsObject()
  filters!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  sort?: string;
}

class ExportBodyDto extends RunBodyDto {
  @IsString()
  format!: 'pdf' | 'excel';
}

class SavedFilterBodyDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsObject()
  filters!: object;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

class SavedFilterUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  filters?: object;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  list() {
    return this.reports.listTypes();
  }

  @Post(':reportType/run')
  run(@Param('reportType') reportType: string, @Body() body: RunBodyDto) {
    return this.reports.run(reportType, body.filters ?? {});
  }

  @Post(':reportType/export')
  async export(
    @Param('reportType') reportType: string,
    @Body() body: ExportBodyDto,
    @Res() res: Response,
  ) {
    const file = await this.reports.export(
      reportType,
      body.format,
      body.filters ?? {},
    );
    res.setHeader('Content-Type', file.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.fileName}"`,
    );
    res.send(file.buffer);
  }

  @Get(':reportType/saved-filters')
  listSaved(
    @Param('reportType') reportType: string,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.reports.listSaved(reportType, user);
  }

  @Post(':reportType/saved-filters')
  @RequiresMutate()
  @HttpCode(201)
  createSaved(
    @Param('reportType') reportType: string,
    @Body() body: SavedFilterBodyDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.reports.createSaved(reportType, body, user);
  }

  @Patch(':reportType/saved-filters/:filterId')
  @RequiresMutate()
  updateSaved(
    @Param('reportType') reportType: string,
    @Param('filterId') filterId: string,
    @Body() body: SavedFilterUpdateDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.reports.updateSaved(reportType, filterId, body, user);
  }

  @Delete(':reportType/saved-filters/:filterId')
  @RequiresMutate()
  @HttpCode(204)
  async deleteSaved(
    @Param('reportType') reportType: string,
    @Param('filterId') filterId: string,
    @CurrentUser() user: Prisma.User,
  ): Promise<void> {
    await this.reports.deleteSaved(reportType, filterId, user);
  }
}
