import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Woliso Hotel - Branch No. 3' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Woliso' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  city: string;

  @ApiProperty({ example: 'Oromia' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  region: string;

  @ApiProperty({ example: 'Ethiopia', default: 'Ethiopia', required: false })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  country?: string;
}
