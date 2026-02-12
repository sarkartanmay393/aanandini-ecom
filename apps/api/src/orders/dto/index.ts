import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatusEnum {
    PENDING = 'PENDING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
}

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatusEnum)
    status: OrderStatusEnum;
}

export class QueryOrderDto {
    @IsOptional()
    @IsEnum(OrderStatusEnum)
    status?: OrderStatusEnum;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
}
