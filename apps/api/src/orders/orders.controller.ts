import {
    Controller,
    Get,
    Put,
    Param,
    Query,
    Body,
    UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto, QueryOrderDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get('stats')
    getStats() {
        return this.ordersService.getStats();
    }

    @Get()
    findAll(@Query() query: QueryOrderDto) {
        return this.ordersService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Put(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.ordersService.updateStatus(id, dto);
    }
}
