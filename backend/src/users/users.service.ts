import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('email já cadastrado');

    const user = this.repo.create(dto);
    return this.repo.save(user);
  }

  async update(id: number, dto: Partial<CreateUserDto>) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('user não encontrado');

    if (dto.email && dto.email !== user.email) {
      const exists = await this.repo.findOne({ where: { email: dto.email } });
      if (exists) throw new ConflictException('email já cadastrado');
    }

    Object.assign(user, dto);
    return this.repo.save(user);
  }

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('user não encontrado');
    return user;
  }
}


