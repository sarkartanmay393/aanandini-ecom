import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, QueryOrderDto, SimulatePaymentDto, PaymentStatusEnum } from './dto';
import { Prisma } from '@aanandini/db';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) { }

    // ── Admin: List all orders ──────────────────────────────

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
                    user: { select: { id: true, name: true, email: true, phone: true } },
                    items: {
                        include: {
                            product: { select: { id: true, name: true, images: true, price: true } },
                        },
                    },
                    shippingAddress: true,
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

    // ── Get single order ────────────────────────────────────

    async findOne(id: string) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                items: {
                    include: {
                        product: { select: { id: true, name: true, images: true, price: true } },
                    },
                },
                shippingAddress: true,
            },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID "${id}" not found`);
        }

        return order;
    }

    // ── Customer: Create order ──────────────────────────────

    async createOrder(userId: string, dto: CreateOrderDto) {
        // Validate address belongs to user
        const address = await this.prisma.address.findFirst({
            where: { id: dto.shippingAddressId, userId },
        });
        if (!address) {
            throw new BadRequestException('Invalid shipping address');
        }

        // Validate products and calculate total
        let total = 0;
        const itemsData: { productId: string; quantity: number; price: number }[] = [];

        for (const item of dto.items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
            });
            if (!product) {
                throw new BadRequestException(`Product ${item.productId} not found`);
            }
            if (product.stock < item.quantity) {
                throw new BadRequestException(`Insufficient stock for "${product.name}"`);
            }
            itemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
            });
            total += product.price * item.quantity;
        }

        // Create order and decrement stock in a transaction
        const order = await this.prisma.$transaction(async (tx) => {
            const created = await tx.order.create({
                data: {
                    userId,
                    total,
                    shippingAddressId: dto.shippingAddressId,
                    status: 'PENDING',
                    paymentStatus: 'PENDING',
                    items: { create: itemsData },
                },
                include: {
                    items: {
                        include: {
                            product: { select: { id: true, name: true, images: true, price: true } },
                        },
                    },
                    shippingAddress: true,
                },
            });

            // Decrement stock
            for (const item of itemsData) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            return created;
        });

        return order;
    }

    // ── Simulate payment ────────────────────────────────────

    async simulatePayment(orderId: string, userId: string, dto: SimulatePaymentDto) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.paymentStatus === 'SUCCESS') {
            throw new BadRequestException('Order already paid');
        }

        // Determine result: use provided or random
        let result: PaymentStatusEnum = dto.result || PaymentStatusEnum.PENDING;
        if (!dto.result) {
            const rand = Math.random();
            result = rand < 0.7 ? PaymentStatusEnum.SUCCESS : rand < 0.9 ? PaymentStatusEnum.FAILED : PaymentStatusEnum.PENDING;
        }

        const paymentId = result === PaymentStatusEnum.SUCCESS ? `PAY_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` : null;

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: result as any,
                paymentId,
                status: result === 'SUCCESS' ? 'PROCESSING' : order.status,
            },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, images: true, price: true } },
                    },
                },
                shippingAddress: true,
            },
        });

        return {
            paymentStatus: result,
            paymentId,
            order: updated,
        };
    }

    // ── Admin: Update status ────────────────────────────────

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
                shippingAddress: true,
            },
        });
    }

    // ── Admin: Delete order ─────────────────────────────────

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.order.delete({ where: { id } });
        return { message: 'Order deleted' };
    }

    // ── Dashboard stats ─────────────────────────────────────

    async getStats() {
        const [totalOrders, totalProducts, totalUsers, revenueResult] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.product.count(),
            this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
            this.prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'SUCCESS' } }),
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
