import { RelatorioEventItem } from "./../../domain/interfaces/events-relatorio.repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "../../../../tables/events/entities/event.entity";
import {
  EventsListRepository,
  ListEventsParams,
  ListEventsResult,
} from "../../domain/interfaces/events-list.repository.interface";
import {
  EventsRelatorioRepository,
  RelatorioEventItem,
  RelatorioEventParams,
} from "../../domain/interfaces/events-relatorio.repository.interface";

@Injectable()
export class TypeormEventsRelatorioRepository implements EventsRelatorioRepository {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async list(params: RelatorioEventParams): Promise<RelatorioEventItem> {
    const dataInicial = new Date(params.startDate);
    const dataFinal = new Date(params.endDate);

    const queryBuilder = this.eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.user", "user")
      .leftJoinAndSelect("event.status", "status")
      .leftJoinAndSelect("event.category", "category")
      .andWhere("event.startDate >= :startDate", {
        startDate: dataInicial,
      })
      .andWhere("event.endDate <= :endDate", {
        endDate: dataFinal,
      });

    const [events, total] = await queryBuilder.getManyAndCount();
    let qdtStatus1 = 0;
    let qtdStatus2 = 0;
    let nomesCategoriasUnicos = [];
    events.forEach((element) => {
      if (element.statusId == 1) qdtStatus1++;
      else qtdStatus2++;
      if (nomesCategoriasUnicos.indexOf(element.category.name) == -1) {
        nomesCategoriasUnicos.push();
      }
    });

    console.log(qdtStatus1, qtdStatus2, nomesCategoriasUnicos);

    return {
      items: [events],
    };
  }
}
