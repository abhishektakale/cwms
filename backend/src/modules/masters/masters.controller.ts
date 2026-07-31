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
import { BadRequestException } from '@nestjs/common';
import * as Prisma from '@prisma/client';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { CurrentUser } from '../../shared/auth/current-user.decorator';
import { Roles } from '../../shared/auth/roles.decorator';
import { MastersService } from './masters.service';
import { MASTER_TYPE_API, MasterTypeApi } from './master-type.util';

class MasterCreateDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

class MasterUpdateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

@Controller('masters')
export class MastersController {
  constructor(private readonly masters: MastersService) {}

  @Get(':masterType')
  list(
    @Param('masterType') masterType: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('q') q?: string,
  ) {
    return this.masters.list(
      this.parseType(masterType),
      Number(page ?? 1),
      Number(pageSize ?? 50),
      q,
    );
  }

  @Post(':masterType')
  @Roles('Administrator')
  @HttpCode(201)
  create(
    @Param('masterType') masterType: string,
    @Body() body: MasterCreateDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.masters.create(this.parseType(masterType), body.name, user);
  }

  @Patch(':masterType/:masterId')
  @Roles('Administrator')
  update(
    @Param('masterType') masterType: string,
    @Param('masterId', ParseUUIDPipe) masterId: string,
    @Body() body: MasterUpdateDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.masters.update(
      this.parseType(masterType),
      masterId,
      body,
      user,
    );
  }

  @Delete(':masterType/:masterId')
  @Roles('Administrator')
  @HttpCode(204)
  async remove(
    @Param('masterType') masterType: string,
    @Param('masterId', ParseUUIDPipe) masterId: string,
    @CurrentUser() user: Prisma.User,
  ): Promise<void> {
    await this.masters.remove(this.parseType(masterType), masterId, user);
  }

  private parseType(masterType: string): MasterTypeApi {
    if (!(MASTER_TYPE_API as readonly string[]).includes(masterType)) {
      throw new BadRequestException({
        title: 'Bad Request',
        status: 400,
        code: 'INVALID_MASTER_TYPE',
        detail: `masterType must be one of: ${MASTER_TYPE_API.join(', ')}`,
      });
    }
    return masterType as MasterTypeApi;
  }
}
