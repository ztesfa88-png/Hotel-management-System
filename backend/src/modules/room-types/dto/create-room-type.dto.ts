import { IsString, IsNumber, IsOptional, IsArray, Min, Max, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRoomTypeDto {
  @ApiProperty({ example: 'Deluxe Suite' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1999.99, minimum: 899.99, maximum: 4999.99 })
  @Type(() => Number)
  @IsNumber()
  @Min(899.99)
  @Max(4999.99)
  basePrice: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxGuests: number;

  @ApiPropertyOptional({ example: ['WiFi', 'TV', 'Air Conditioning'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}
