import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Evento } from './entities/evento.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EventosService {
  constructor(@InjectRepository(Evento)
  private readonly repo: Repository<Evento>
  ) {}
  async create(createEventoDto: CreateEventoDto) {
    // lógica para criar um evento
    const exists = await this.repo.findOne({ where: { nome_evento: createEventoDto.nome_evento, data_evento: createEventoDto.data_evento } });
    if (exists) {
      throw new ConflictException('Evento já cadastrado para esta data');
    }

    const evento = this.repo.create(createEventoDto);
    return this.repo.save(evento);
  }

  findAll() {
    return `This action returns all eventos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} evento`;
  }

  update(id: number, updateEventoDto: UpdateEventoDto) {
    return `This action updates a #${id} evento`;
  }

  remove(id: number) {
    return `This action removes a #${id} evento`;
  }
}
