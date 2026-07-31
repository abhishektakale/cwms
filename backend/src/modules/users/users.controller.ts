import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import * as Prisma from '@prisma/client';
import { RoleCode } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { CurrentUser } from '../../shared/auth/current-user.decorator';
import { Roles } from '../../shared/auth/roles.decorator';
import { UsersService } from './users.service';

enum RoleDto {
  Administrator = 'Administrator',
  DataEntryOperator = 'DataEntryOperator',
  Engineer = 'Engineer',
  Accounts = 'Accounts',
  Viewer = 'Viewer',
}

class CreateUserDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  loginId!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(RoleDto)
  role!: RoleCode;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(RoleDto)
  role?: RoleCode;

  @IsOptional()
  @IsString()
  mobile?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

@Controller('users')
@Roles('Administrator')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('q') q?: string,
    @Query('role') role?: RoleCode,
    @Query('active') active?: string,
  ) {
    return this.users.list({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
      q,
      role,
      active:
        active === undefined
          ? undefined
          : active === 'true' || active === '1',
    });
  }

  @Post()
  @HttpCode(201)
  create(@Body() body: CreateUserDto, @CurrentUser() user: Prisma.User) {
    return this.users.create(body, user);
  }

  @Get(':userId')
  get(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.users.get(userId);
  }

  @Patch(':userId')
  update(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() user: Prisma.User,
  ) {
    return this.users.update(userId, body, user);
  }

  @Post(':userId/deactivate')
  @HttpCode(204)
  async deactivate(
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: Prisma.User,
  ): Promise<void> {
    await this.users.setActive(userId, false, user);
  }

  @Post(':userId/activate')
  @HttpCode(204)
  async activate(
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: Prisma.User,
  ): Promise<void> {
    await this.users.setActive(userId, true, user);
  }
}
