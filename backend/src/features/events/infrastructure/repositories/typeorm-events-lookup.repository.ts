import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "../../../../tables/categories/entities/category.entity";
import { EventStatus } from "../../../../tables/event-statuses/entities/event-status.entity";
import {
  EventsLookupRepository,
  SelectionOptionItem,
} from "../../domain/interfaces/events-lookup.repository.interface";

@Injectable()
export class TypeormEventsLookupRepository implements EventsLookupRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(EventStatus)
    private readonly eventStatusRepository: Repository<EventStatus>,
  ) {}

  async listCategories(): Promise<SelectionOptionItem[]> {
    const categories = await this.categoryRepository.find({
      order: { name: "ASC" },
    });

    return categories.map((item) => ({ id: item.id, name: item.name }));
  }

  async listStatuses(): Promise<SelectionOptionItem[]> {
    const statuses = await this.eventStatusRepository.find({
      order: { name: "ASC" },
    });

    return statuses.map((item) => ({ id: item.id, name: item.name }));
  }
}
