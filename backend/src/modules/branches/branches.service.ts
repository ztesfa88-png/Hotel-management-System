import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.branch.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { rooms: true } },
      },
    });
  }

  async create(createBranchDto: CreateBranchDto) {
    const existing = await this.prisma.branch.findUnique({
      where: { name: createBranchDto.name },
    });

    if (existing) {
      throw new ConflictException(`Branch "${createBranchDto.name}" already exists`);
    }

    return this.prisma.branch.create({ data: createBranchDto });
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    if (updateBranchDto.name && updateBranchDto.name !== branch.name) {
      const existing = await this.prisma.branch.findUnique({
        where: { name: updateBranchDto.name },
      });

      if (existing) {
        throw new ConflictException(`Branch "${updateBranchDto.name}" already exists`);
      }
    }

    return this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });
  }
}
