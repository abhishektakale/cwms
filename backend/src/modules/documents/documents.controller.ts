import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as Prisma from '@prisma/client';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../shared/auth/current-user.decorator';
import { RequiresMutate } from '../../shared/auth/roles.decorator';
import { DocumentsService } from './documents.service';

type MultipartBody = {
  documentTypeId?: string;
  documentNumber?: string;
  title?: string;
  remarks?: string;
};

@Controller()
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get('documents')
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('q') q?: string,
    @Query('workId') workId?: string,
    @Query('documentTypeId') documentTypeId?: string,
    @Query('uploadedFrom') uploadedFrom?: string,
    @Query('uploadedTo') uploadedTo?: string,
  ) {
    return this.documents.list({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
      q,
      workId,
      documentTypeId,
      uploadedFrom,
      uploadedTo,
    });
  }

  @Get('works/:workId/documents')
  listWork(@Param('workId', ParseUUIDPipe) workId: string) {
    return this.documents.listByWork(workId);
  }

  @Post('works/:workId/documents')
  @RequiresMutate()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('workId', ParseUUIDPipe) workId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @CurrentUser() user: Prisma.User,
  ) {
    const body = req.body as MultipartBody;
    return this.documents.upload(
      workId,
      {
        documentTypeId: body.documentTypeId ?? '',
        documentNumber: body.documentNumber,
        title: body.title,
        remarks: body.remarks,
      },
      file,
      user,
    );
  }

  @Post('works/:workId/documents:batch')
  @RequiresMutate()
  @UseInterceptors(FilesInterceptor('files', 20))
  uploadBatch(
    @Param('workId', ParseUUIDPipe) workId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
    @CurrentUser() user: Prisma.User,
  ) {
    const body = req.body as MultipartBody;
    return this.documents.uploadBatch(
      workId,
      body.documentTypeId ?? '',
      files ?? [],
      user,
    );
  }

  @Get('documents/:documentId')
  get(@Param('documentId', ParseUUIDPipe) documentId: string) {
    return this.documents.get(documentId);
  }

  @Delete('documents/:documentId')
  @RequiresMutate()
  @HttpCode(204)
  async remove(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Query('confirm') confirm: string,
    @CurrentUser() user: Prisma.User,
  ): Promise<void> {
    await this.documents.remove(
      documentId,
      confirm === 'true' || confirm === '1',
      user,
    );
  }

  @Get('documents/:documentId/content')
  async content(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Query('disposition') disposition: string | undefined,
    @Res() res: Response,
  ) {
    const file = await this.documents.getContent(documentId);
    const disp =
      disposition === 'attachment' ? 'attachment' : 'inline';
    res.setHeader('Content-Type', file.contentType);
    res.setHeader(
      'Content-Disposition',
      `${disp}; filename="${file.fileName.replace(/"/g, '')}"`,
    );
    res.send(file.body);
  }
}
