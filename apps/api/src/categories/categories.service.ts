import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.category.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { products: true },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID "${id}" not found`);
        }

        return category;
    }

    async create(dto: CreateCategoryDto) {
        const existing = await this.prisma.category.findUnique({
            where: { slug: dto.slug },
        });

        if (existing) {
            throw new ConflictException(`Category with slug "${dto.slug}" already exists`);
        }

        return this.prisma.category.create({
            data: dto,
        });
    }

    async update(id: string, dto: UpdateCategoryDto) {
        await this.findOne(id);

        if (dto.slug) {
            const existing = await this.prisma.category.findFirst({
                where: { slug: dto.slug, NOT: { id } },
            });

            if (existing) {
                throw new ConflictException(`Category with slug "${dto.slug}" already exists`);
            }
        }

        return this.prisma.category.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.category.delete({
            where: { id },
        });
    }

    async bulkCreate(items: CreateCategoryDto[]) {
        const results = [];
        const skipped = [];
        for (const item of items) {
            const existing = await this.prisma.category.findUnique({
                where: { slug: item.slug },
            });
            if (existing) {
                skipped.push(item.slug);
                continue;
            }
            const category = await this.prisma.category.create({ data: item });
            results.push(category);
        }
        return { created: results.length, skipped: skipped.length, categories: results };
    }
}
