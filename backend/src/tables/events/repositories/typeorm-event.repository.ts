import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "../entities/event.entity";
import { PaginatedResult } from "../contracts/event.contracts";
import { EventRepository, ListEventsParams } from "./event.repository";

@Injectable()
export class TypeOrmEventRepository implements EventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly ormRepository: Repository<Event>,
  ) {}

  async list(params: ListEventsParams): Promise<PaginatedResult<Event>> {
    const { page, size, search, sortBy, sortDir } = params;

    const query = this.ormRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.user", "user")
      .leftJoinAndSelect("event.status", "status")
      .leftJoinAndSelect("event.category", "category");

    if (search) {
      query.where("LOWER(event.title) LIKE :search", {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const [items, totalItems] = await query
      .orderBy(`event.${sortBy}`, sortDir)
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return {
      items,
      page,
      size,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / size)),
    };
  }

  findById(id: number): Promise<Event | null> {
    return this.ormRepository.findOne({
      where: { id },
      relations: {
        user: true,
        status: true,
        category: true,
      },
    });
  }

  save(event: Event): Promise<Event> {
    return this.ormRepository.save(event);
  }

  async remove(event: Event): Promise<void> {
    await this.ormRepository.remove(event);
  }
}

