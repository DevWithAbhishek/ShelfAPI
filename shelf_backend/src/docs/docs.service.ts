import { Injectable } from '@nestjs/common';
import {
  addDocumentDto,
  updateDocumentDto,
} from '../common/schemas/schema.zod';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DocsService {
  constructor(private prisma: PrismaService) {}
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
}
