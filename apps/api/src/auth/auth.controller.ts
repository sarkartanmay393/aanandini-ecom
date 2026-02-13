import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, CreateAddressDto, UpdateAddressDto, UpdateProfileDto, SendOtpDto, VerifyOtpDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    // ── Phone OTP ──────────────────────────────────────────────

    @Post('otp/send')
    async sendOtp(@Body() dto: SendOtpDto) {
        return this.authService.sendOtp(dto);
    }

    @Post('otp/verify')
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put('me')
    async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
        return this.authService.updateProfile(req.user.userId, dto);
    }

    // ── Addresses ──────────────────────────────────────────────

    @UseGuards(JwtAuthGuard)
    @Get('me/addresses')
    async getAddresses(@Request() req: any) {
        return this.authService.getAddresses(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('me/addresses')
    async createAddress(@Request() req: any, @Body() dto: CreateAddressDto) {
        return this.authService.createAddress(req.user.userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Put('me/addresses/:id')
    async updateAddress(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
        return this.authService.updateAddress(req.user.userId, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('me/addresses/:id')
    async deleteAddress(@Request() req: any, @Param('id') id: string) {
        return this.authService.deleteAddress(req.user.userId, id);
    }

    // ── Orders ─────────────────────────────────────────────────

    @UseGuards(JwtAuthGuard)
    @Get('me/orders')
    async getMyOrders(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.authService.getMyOrders(
            req.user.userId,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 10,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('me/orders/:id')
    async getMyOrder(@Request() req: any, @Param('id') id: string) {
        return this.authService.getMyOrder(req.user.userId, id);
    }

    // ── Wishlist ───────────────────────────────────────────────

    @UseGuards(JwtAuthGuard)
    @Get('me/wishlist')
    async getWishlist(@Request() req: any) {
        return this.authService.getWishlist(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('me/wishlist/:productId')
    async addToWishlist(@Request() req: any, @Param('productId') productId: string) {
        return this.authService.addToWishlist(req.user.userId, productId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('me/wishlist/:productId')
    async removeFromWishlist(@Request() req: any, @Param('productId') productId: string) {
        return this.authService.removeFromWishlist(req.user.userId, productId);
    }
}
