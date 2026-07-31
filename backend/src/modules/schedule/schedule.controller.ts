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
  MinLength,
} from 'class-validator';
import { CurrentUser } from '../../shared/auth/current-user.decorator';
import { RequiresMutate } from '../../shared/auth/roles.decorator';
import { ScheduleService, ScheduleWrite } from './schedule.service';

class ScheduleBodyDto implements ScheduleWrite {
  @IsString()
  @MinLength(1)
  activity!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  finishDate?: string | null;

  @IsOptional()
  @IsDateString()
  actualStart?: string | null;

  @IsOptional()
  @IsDateString()
  actualFinish?: string | null;

  @IsOptional()
  @IsString()
  progressPercent?: string | null;
}

@Controller()
export class ScheduleController {
  constructor(private readonly schedule: ScheduleService) {}

  @Get('works/:workId/schedule-activities')
  list(@Param('workId', ParseUUIDPipe) workId: string) {
    return this.schedule.listByWork(workId);
  }

  @Post('works/:workId/schedule-activities')
  @RequiresMutate()
  @HttpCode(201)
  create(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Body() body: ScheduleBodyDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.schedule.create(workId, body, user);
  }

  @Patch('schedule-activities/:activityId')
  @RequiresMutate()
  update(
    @Param('activityId', ParseUUIDPipe) activityId: string,
    @Body() body: ScheduleBodyDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.schedule.update(activityId, body, user);
  }

  @Delete('schedule-activities/:activityId')
  @RequiresMutate()
  @HttpCode(204)
  async remove(
    @Param('activityId', ParseUUIDPipe) activityId: string,
    @CurrentUser() user: Prisma.User,
  ): Promise<void> {
    await this.schedule.remove(activityId, user);
  }
}
