import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrderStatusDto, QueryOrderDto } from './dto';
import { Prisma } from '@anandibi/db';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(query: QueryOrderDto) {
        const { status, page = 1, limit = 10 } = query;

        const where: Prisma.OrderWhereInput = {};
        if (status) {
            where.status = status;
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    items: {
                        include: {
                            product: { select: { id: true, name: true, images: true } },
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data: orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: {
                    include: {
                        product: { select: { id: true, name: true, images: true, price: true } },
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID "${id}" not found`);
        }

        return order;
    }

    async updateStatus(id: string, dto: UpdateOrderStatusDto) {
        await this.findOne(id);

        return this.prisma.order.update({
            where: { id },
            data: { status: dto.status },
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: {
                    include: {
                        product: { select: { id: true, name: true, images: true } },
                    },
                },
            },
        });
    }

    async getStats() {
        const [totalOrders, totalProducts, totalUsers, revenueResult] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.product.count(),
            this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
            this.prisma.order.aggregate({ _sum: { total: true } }),
        ]);

        const pendingOrders = await this.prisma.order.count({ where: { status: 'PENDING' } });

        return {
            totalOrders,
            totalProducts,
            totalUsers,
            totalRevenue: revenueResult._sum.total || 0,
            pendingOrders,
        };
    }
}
