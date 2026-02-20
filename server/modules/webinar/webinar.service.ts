import { prisma } from '../../shared/prisma/client';
import { nanoid } from 'nanoid';

export class WebinarService {
  async create(data: {
    title: string;
    description?: string;
    coverImage?: string;
    category?: string;
    scheduledAt?: Date;
    duration?: number;
    hostId: number;
  }) {
    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nanoid(6)}`;

    const webinar = await prisma.webinar.create({
      data: {
        ...data,
        slug,
        status: 'draft',
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return webinar;
  }

  async list(filters?: {
    status?: string;
    category?: string;
    hostId?: number;
  }) {
    const webinars = await prisma.webinar.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.hostId && { hostId: filters.hostId }),
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            participants: true,
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return webinars;
  }

  async getById(id: number) {
    const webinar = await prisma.webinar.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            factory: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
        products: {
          include: {
            product: {
              include: {
                factory: {
                  select: {
                    id: true,
                    name: true,
                    logo: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!webinar) {
      throw new Error('Webinar not found');
    }

    return webinar;
  }

  async update(id: number, data: Partial<{
    title: string;
    description: string;
    coverImage: string;
    status: string;
    scheduledAt: Date;
    duration: number;
  }>) {
    const webinar = await prisma.webinar.update({
      where: { id },
      data,
    });

    return webinar;
  }

  async delete(id: number) {
    await prisma.webinar.delete({
      where: { id },
    });

    return { success: true };
  }

  async addParticipant(webinarId: number, data: {
    userId?: number;
    factoryId?: number;
    role?: string;
  }) {
    const participant = await prisma.webinarParticipant.create({
      data: {
        webinarId,
        ...data,
        status: 'invited',
      },
    });

    return participant;
  }

  async addProducts(webinarId: number, productIds: number[]) {
    const products = await Promise.all(
      productIds.map((productId, index) =>
        prisma.webinarProduct.create({
          data: {
            webinarId,
            productId,
          },
        })
      )
    );

    return products;
  }
}

export const webinarService = new WebinarService();
