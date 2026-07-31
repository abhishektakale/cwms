import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import * as Prisma from '@prisma/client';
import { IsBoolean, IsIn, IsString } from 'class-validator';
import { CurrentUser } from '../../shared/auth/current-user.decorator';
import { Roles } from '../../shared/auth/roles.decorator';
import { BackupsService } from './backups.service';

class RestoreBodyDto {
  @IsString()
  @IsIn(['RESTORE'])
  confirmPhrase!: string;

  @IsBoolean()
  acknowledgedDestructive!: boolean;
}

@Controller('backups')
@Roles('Administrator')
export class BackupsController {
  constructor(private readonly backups: BackupsService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.backups.list(
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20,
    );
  }

  @Get(':backupId')
  get(@Param('backupId', ParseUUIDPipe) backupId: string) {
    return this.backups.get(backupId);
  }

  @Post(':backupId/restore')
  @HttpCode(202)
  restore(
    @Param('backupId', ParseUUIDPipe) backupId: string,
    @Body() body: RestoreBodyDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.backups.restore(backupId, body, user);
  }

  /** Internal/dev helper to seed a weekly stub backup record. */
  @Post()
  @HttpCode(201)
  createStub() {
    return this.backups.runWeeklyStub();
  }
}
