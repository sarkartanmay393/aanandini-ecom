import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto';
import { Prisma } from '@aanandini/db';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(query: QueryProductDto) {
        const { search, categoryId, minPrice, maxPrice, page = 1, limit = 10 } = query;

        const where: Prisma.ProductWhereInput = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = minPrice;
            if (maxPrice !== undefined) where.price.lte = maxPrice;
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: { category: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                reviews: {
                    include: {
                        user: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID "${id}" not found`);
        }

        return product;
    }

    async create(dto: CreateProductDto) {
        return this.prisma.product.create({
            data: {
                name: dto.name,
                description: dto.description,
                price: dto.price,
                stock: dto.stock,
                images: dto.images || [],
                categoryId: dto.categoryId,
            },
            include: { category: true },
        });
    }

    async update(id: string, dto: UpdateProductDto) {
        await this.findOne(id);

        return this.prisma.product.update({
            where: { id },
            data: dto,
            include: { category: true },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.product.delete({
            where: { id },
        });
    }
}
