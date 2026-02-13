import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { RegisterDto, LoginDto, CreateAddressDto, UpdateAddressDto, UpdateProfileDto, SendOtpDto, VerifyOtpDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly notificationService: NotificationService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
            },
        });

        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken: token,
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken: token,
        };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');

        return this.prisma.user.update({
            where: { id: userId },
            data: dto,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        });
    }

    // ── Addresses ────────────────────────────────────────────

    async getAddresses(userId: string) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }

    async createAddress(userId: string, dto: CreateAddressDto) {
        // If setting as default, unset existing default
        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        // If this is the first address, make it default
        const count = await this.prisma.address.count({ where: { userId } });
        if (count === 0) {
            dto.isDefault = true;
        }

        return this.prisma.address.create({
            data: { ...dto, userId },
        });
    }

    async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address) throw new NotFoundException('Address not found');

        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return this.prisma.address.update({
            where: { id: addressId },
            data: dto,
        });
    }

    async deleteAddress(userId: string, addressId: string) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address) throw new NotFoundException('Address not found');

        await this.prisma.address.delete({ where: { id: addressId } });
        return { message: 'Address deleted' };
    }

    // ── Orders for customer ─────────────────────────────────

    async getMyOrders(userId: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { userId },
                include: {
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
            this.prisma.order.count({ where: { userId } }),
        ]);

        return {
            data: orders,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async getMyOrder(userId: string, orderId: string) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true, images: true, price: true } },
                    },
                },
                shippingAddress: true,
            },
        });

        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    // ── Wishlist ─────────────────────────────────────────────

    async getWishlist(userId: string) {
        return this.prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    include: { category: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async addToWishlist(userId: string, productId: string) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new NotFoundException('Product not found');

        const existing = await this.prisma.wishlist.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        if (existing) return existing;

        return this.prisma.wishlist.create({
            data: { userId, productId },
            include: { product: true },
        });
    }

    async removeFromWishlist(userId: string, productId: string) {
        const existing = await this.prisma.wishlist.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        if (!existing) throw new NotFoundException('Product not in wishlist');

        await this.prisma.wishlist.delete({
            where: { userId_productId: { userId, productId } },
        });
        return { message: 'Removed from wishlist' };
    }

    private generateToken(userId: string, email: string | null, role: string): string {
        return this.jwtService.sign({ sub: userId, email: email || '', role });
    }

    // ── Phone OTP ─────────────────────────────────────────────

    async sendOtp(dto: SendOtpDto) {
        const otp = this.notificationService.generateOtp();

        // Delete any existing OTPs for this phone
        await this.prisma.otp.deleteMany({ where: { phone: dto.phone } });

        // Create new OTP with 5-minute expiry
        await this.prisma.otp.create({
            data: {
                phone: dto.phone,
                code: otp,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });

        // Send OTP via SMS
        await this.notificationService.sendSmsOtp(dto.phone, otp);

        return { message: 'OTP sent successfully', phone: dto.phone };
    }

    async verifyOtp(dto: VerifyOtpDto) {
        const otpRecord = await this.prisma.otp.findFirst({
            where: {
                phone: dto.phone,
                code: dto.code,
                verified: false,
                expiresAt: { gt: new Date() },
            },
        });

        if (!otpRecord) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        // Mark OTP as verified
        await this.prisma.otp.update({
            where: { id: otpRecord.id },
            data: { verified: true },
        });

        // Find or create user
        let user = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
        });

        if (!user) {
            // Auto-create user for new phone numbers
            user = await this.prisma.user.create({
                data: {
                    phone: dto.phone,
                    name: '',
                },
            });
        }

        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
            accessToken: token,
        };
    }
}
