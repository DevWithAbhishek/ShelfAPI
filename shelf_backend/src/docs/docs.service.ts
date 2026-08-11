import { Injectable } from '@nestjs/common';
import {
  addDocumentDto,
  updateDocumentDto,
} from '../common/schemas/schema.zod';
import { PrismaService } from '../prisma.service';
import { FileMissing } from '../common/errors/errors-class.error';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

type UploadAttachmentInput = {
  userId: string;
  docId: string;
  file: Express.Multer.File
}

@Injectable()
export class DocsService {
  constructor(private readonly prisma: PrismaService, private readonly s3: S3Client) {}
  async findAllDocuments() {}

  async addDocument(addDocumentDto: addDocumentDto, userId: string) {
    await this.prisma.document.create({
      data: {
        title: addDocumentDto.title,
        description: addDocumentDto.description,
        user_id: userId,
        tags: {
          create: addDocumentDto.tags?.map((name) => ({
            tag: {
              connectOrCreate: {
                where: {
                  user_id_name: {
                    user_id: userId,
                    name,
                  },
                },
                create: {
                  user_id: userId,
                  name,
                },
              },
            },
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async deleteAllDocs(userId: string) {
    await this.prisma.document.deleteMany({
      where: { user_id: userId },
    });
  }

  async getOneDocument(docId: string, userId: string) {
    return await this.prisma.document.findUnique({
      where: { id: docId, user_id: userId },
    });
  }

  async updateOneDoc(docId: string, userId: string, data: updateDocumentDto) {
    await this.prisma.document.update({
      where: { id: docId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.tags !== undefined && {
          tags: {
            deleteMany: {},
            create: data.tags.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: {
                    user_id_name: {
                      user_id: userId,
                      name: tagName,
                    },
                  },
                  create: {
                    user_id: userId,
                    name: tagName,
                  },
                },
              },
            })),
          },
        }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async deleteOneDoc(docId: string, userId: string) {
    await this.prisma.document.delete({
      where: { id: docId, user_id: userId },
    });
  }

  async uploadAttachment({ userId, docId, file }: UploadAttachmentInput) {
    const doc = await this.prisma.document.findUnique({
      where: {
        id: docId,
        user_id: userId,
      }
    });

    if (!doc) throw new FileMissing();

    const ext = file.originalname.includes('.') ? file.originalname.split('.').pop() : 'bin';

    const key = `users/${userId}/docs/${docId}/${randomUUID()}.{ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    return this.prisma.attachment.create({
      data: {
        doc_id: docId,
        s3_key: key,
        folder: '/uploads',
        original_filename: file.originalname,
        mime_type: file.mimetype,
        size_bytes: file.size
      }
    })
  }
}
