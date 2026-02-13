import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Query,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, QueryOrderDto, SimulatePaymentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    // ── Admin endpoints ─────────────────────────────────────

    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    getStats() {
        return this.ordersService.getStats();
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findAll(@Query() query: QueryOrderDto) {
        return this.ordersService.findAll(query);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Put(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.ordersService.updateStatus(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.ordersService.remove(id);
    }

    // ── Customer endpoints ──────────────────────────────────

    @Post('checkout')
    @UseGuards(JwtAuthGuard)
    createOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
        return this.ordersService.createOrder(req.user.userId, dto);
    }

    @Post(':id/pay')
    @UseGuards(JwtAuthGuard)
    simulatePayment(
        @Param('id') id: string,
        @Request() req: any,
        @Body() dto: SimulatePaymentDto,
    ) {
        return this.ordersService.simulatePayment(id, req.user.userId, dto);
    }
}
