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
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { CurrentUser } from '../../shared/auth/current-user.decorator';
import { RequiresMutate } from '../../shared/auth/roles.decorator';
import { WorksService, WorkWriteDto } from './works.service';

enum GstTypeDto {
  GstExtra = 'GstExtra',
  GstIncluded = 'GstIncluded',
}

enum WorkStatusDto {
  Planned = 'Planned',
  InProgress = 'InProgress',
  Hold = 'Hold',
  Completed = 'Completed',
}

enum SideDto {
  LHS = 'LHS',
  RHS = 'RHS',
  Both = 'Both',
}

class WorkBodyDto implements WorkWriteDto {
  @IsOptional()
  @IsString()
  projectName?: string | null;

  @IsString()
  @MinLength(1)
  workName!: string;

  @IsOptional()
  @IsUUID()
  workCategoryId?: string | null;

  @IsOptional()
  @IsString()
  client?: string | null;

  @IsOptional()
  @IsString()
  contractor?: string | null;

  @IsOptional()
  @IsUUID()
  clientDepartmentFormatId?: string | null;

  @IsString()
  @MinLength(1)
  workOrderNo!: string;

  @IsDateString()
  workOrderDate!: string;

  @IsEnum(GstTypeDto)
  gstType!: 'GstExtra' | 'GstIncluded';

  @IsOptional()
  @IsString()
  workPortionValue?: string | null;

  @IsOptional()
  @IsString()
  gstPercent?: string | null;

  @IsOptional()
  @IsString()
  totalWorkValue?: string | null;

  @IsOptional()
  @IsString()
  state?: string | null;

  @IsOptional()
  @IsString()
  district?: string | null;

  @IsOptional()
  @IsString()
  taluka?: string | null;

  @IsOptional()
  @IsString()
  village?: string | null;

  @IsOptional()
  @IsString()
  existingChainage?: string | null;

  @IsOptional()
  @IsString()
  designChainage?: string | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsEnum(SideDto)
  side?: 'LHS' | 'RHS' | 'Both' | null;

  @IsOptional()
  @IsString()
  structureType?: string | null;

  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  scheduledCompletion?: string | null;

  @IsOptional()
  @IsDateString()
  actualCompletion?: string | null;

  @IsOptional()
  @IsString()
  physicalProgressPercent?: string | null;

  @IsEnum(WorkStatusDto)
  status!: 'Planned' | 'InProgress' | 'Hold' | 'Completed';

  @IsOptional()
  @IsString()
  remarks?: string | null;

  @IsOptional()
  @IsUUID()
  lockToken?: string;
}

@Controller('works')
export class WorksController {
  constructor(private readonly works: WorksService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('q') q?: string,
    @Query('status') status?: Prisma.WorkStatus,
    @Query('project') project?: string,
    @Query('client') client?: string,
    @Query('contractor') contractor?: string,
    @Query('categoryId') categoryId?: string,
    @Query('trafficLight') trafficLight?: Prisma.TrafficLight,
    @Query('workOrderDateFrom') workOrderDateFrom?: string,
    @Query('workOrderDateTo') workOrderDateTo?: string,
    @Query('sort') sort?: string,
  ) {
    return this.works.list({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
      q,
      status,
      project,
      client,
      contractor,
      categoryId,
      trafficLight,
      workOrderDateFrom,
      workOrderDateTo,
      sort,
    });
  }

  @Get('project-names')
  projectNames(@Query('q') q?: string) {
    return this.works.projectNames(q);
  }

  @Get(':workId')
  get(@Param('workId', ParseUUIDPipe) workId: string) {
    return this.works.get(workId);
  }

  @Post()
  @RequiresMutate()
  @HttpCode(201)
  create(@Body() body: WorkBodyDto, @CurrentUser() user: Prisma.User) {
    return this.works.create(body, user);
  }

  @Patch(':workId')
  @RequiresMutate()
  update(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Body() body: WorkBodyDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.works.update(workId, body, user);
  }

  @Delete(':workId')
  @RequiresMutate()
  @HttpCode(204)
  async remove(
    @Param('workId', ParseUUIDPipe) workId: string,
    @CurrentUser() user: Prisma.User,
  ): Promise<void> {
    await this.works.remove(workId, user);
  }

  @Post(':workId/lock')
  @RequiresMutate()
  acquireLock(
    @Param('workId', ParseUUIDPipe) workId: string,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.works.acquireLock(workId, user);
  }

  @Delete(':workId/lock')
  @RequiresMutate()
  @HttpCode(204)
  async releaseLock(
    @Param('workId', ParseUUIDPipe) workId: string,
    @CurrentUser() user: Prisma.User,
    @Query('lockToken') lockToken?: string,
  ): Promise<void> {
    await this.works.releaseLock(workId, user.id, lockToken);
  }
}
