import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { DocsService } from './docs.service';
import { AuthGuard } from '../auth/auth.guard';
import { type Request, type Response } from 'express';
import { type updateDocumentDto, type addDocumentDto } from '../common/schemas/schema.zod';
import {
  BadRequest,
  Unauthenticated,
} from '../common/errors/errors-class.error';

type AuthenticatedRequest = Request & {
  user?: {
    sub: string;
    username: string;
  };
};

@Controller('docs')
export class DocsController {
  constructor(private docsService: DocsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAll(@Req() req: AuthenticatedRequest, @Res() res: Response) {}

  @Post()
  @UseGuards(AuthGuard)
  async addOne(@Req() req: AuthenticatedRequest, data: addDocumentDto) {
    const userId = req.user?.sub;
    if (!userId) throw new Unauthenticated();
    await this.docsService.addDocument(data, userId);

    return {
      success: true,
      message: 'Document added successfully',
    };
  }

  @Delete()
  @UseGuards(AuthGuard)
  async DeleteAll(@Req() req: AuthenticatedRequest, data: addDocumentDto) {
    const userId = req.user?.sub;
    if (!userId) throw new Unauthenticated();
    await this.docsService.deleteAllDocs(userId);

    return {
      success: true,
      message: 'Documents deleted successfully',
    };
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async getOne(@Req() req: AuthenticatedRequest, @Param('id') docId: string) {
    const userId = req.user?.sub;
    if (!userId) throw new Unauthenticated();

    return await this.docsService.getOneDocument(docId, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateOne(@Req() req: AuthenticatedRequest, @Param('id') docId: string, data: updateDocumentDto) {
    const userId = req.user?.sub;
    if (!userId) throw new Unauthenticated();

    return await this.docsService.updateOneDoc(docId, userId, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteOne(
    @Req() req: AuthenticatedRequest,
    @Param('id') docId: string,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new Unauthenticated();

    await this.docsService.deleteOneDoc(docId, userId);
    return {
      success: true,
      message: `Document: ${docId} deleted successfully`,
    };
  }
}
