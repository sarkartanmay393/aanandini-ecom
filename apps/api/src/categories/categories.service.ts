import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    async findAll() {
        return this.prisma.category.findMany({
            include: {
                _count: { select: { products: true } },
                products: {
                    take: 1,
                    select: { images: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
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
        const slug = dto.slug || this.generateSlug(dto.name);

        const existing = await this.prisma.category.findUnique({
            where: { slug },
        });

        if (existing) {
            throw new ConflictException(`Category with slug "${slug}" already exists`);
        }

        return this.prisma.category.create({
            data: { name: dto.name, slug },
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
            const slug = item.slug || this.generateSlug(item.name);
            const existing = await this.prisma.category.findUnique({
                where: { slug },
            });
            if (existing) {
                skipped.push(slug);
                continue;
            }
            const category = await this.prisma.category.create({ data: { name: item.name, slug } });
            results.push(category);
        }
        return { created: results.length, skipped: skipped.length, categories: results };
    }
}
