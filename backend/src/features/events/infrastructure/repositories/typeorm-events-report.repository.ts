import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "../../../../tables/categories/entities/category.entity";
import { EventStatus } from "../../../../tables/event-statuses/entities/event-status.entity";
import { Event } from "../../../../tables/events/entities/event.entity";
import {
  EventsReportRepository,
  EventsSummaryResult,
} from "../../domain/interfaces/events-report.repository.interface";

@Injectable()
export class TypeormEventsReportRepository implements EventsReportRepository {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventStatus)
    private readonly statusRepository: Repository<EventStatus>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getSummary(params: {
    startDate: Date;
    endDate: Date;
  }): Promise<EventsSummaryResult> {
    const { startDate, endDate } = params;

    const overlapWhere =
      "event.startDate <= :endDate AND event.endDate >= :startDate";

    const total = await this.eventRepository
      .createQueryBuilder("event")
      .where(overlapWhere, { startDate, endDate })
      .getCount();

    const statusCountsRaw = await this.eventRepository
      .createQueryBuilder("event")
      .innerJoin("event.status", "status")
      .select("status.id", "statusId")
      .addSelect("status.name", "statusName")
      .addSelect("COUNT(*)", "total")
      .where(overlapWhere, { startDate, endDate })
      .groupBy("status.id")
      .addGroupBy("status.name")
      .getRawMany();

    const statuses = await this.statusRepository.find({
      order: { name: "ASC" },
    });

    const statusTotalsMap = new Map(
      statusCountsRaw.map((row) => [Number(row.statusId), Number(row.total)]),
    );

    const totalsByStatus = statuses.map((status) => ({
      id: status.id,
      name: status.name,
      total: statusTotalsMap.get(status.id) ?? 0,
    }));

    const categoryCountsRaw = await this.eventRepository
      .createQueryBuilder("event")
      .leftJoin("event.category", "category")
      .select("category.id", "categoryId")
      .addSelect("category.name", "categoryName")
      .addSelect("COUNT(*)", "total")
      .where(overlapWhere, { startDate, endDate })
      .groupBy("category.id")
      .addGroupBy("category.name")
      .getRawMany();

    const totalsByCategory = categoryCountsRaw.map((row) => ({
      id: row.categoryId ? Number(row.categoryId) : null,
      name: row.categoryName ?? "Sem categoria",
      total: Number(row.total) || 0,
    }));

    totalsByCategory.sort((a, b) => a.name.localeCompare(b.name));

    return {
      total,
      totalsByStatus,
      totalsByCategory,
    };
  }
}
