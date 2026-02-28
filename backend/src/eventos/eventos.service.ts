import { Injectable } from "@nestjs/common";
import { CreateEventoDto } from "./dto/create-evento.dto";
import { UpdateEventoDto } from "./dto/update-evento.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Evento } from "./entities/evento.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class EventosService {
  constructor(private dataSource: DataSource) {}
  private eventosRepository = this.dataSource.getRepository(Evento);

  create(createEventoDto: CreateEventoDto) {
    return this.eventosRepository.save(createEventoDto);
  }

  findAll() {
    return this.eventosRepository.find();
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
