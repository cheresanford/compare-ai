import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "../../../../tables/categories/entities/category.entity";
import { EventStatus } from "../../../../tables/event-statuses/entities/event-status.entity";
import { Event } from "../../../../tables/events/entities/event.entity";
import {
  EventsReportRepository,
  EventsSummaryReportParams,
  EventsSummaryReportResult,
  SummaryCountItem,
} from "../../domain/interfaces/events-report.repository.interface";

@Injectable()
export class TypeormEventsReportRepository implements EventsReportRepository {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventStatus)
    private readonly eventStatusRepository: Repository<EventStatus>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getSummary(
    params: EventsSummaryReportParams,
  ): Promise<EventsSummaryReportResult> {
    const overlapWhere =
      "event.startDate < :endDate AND event.endDate > :startDate";

    const totalEvents = await this.eventRepository
      .createQueryBuilder("event")
      .where(overlapWhere, {
        startDate: params.startDate,
        endDate: params.endDate,
      })
      .getCount();

    const statusCountsRaw = await this.eventRepository
      .createQueryBuilder("event")
      .innerJoin("event.status", "status")
      .select("status.id", "id")
      .addSelect("status.name", "name")
      .addSelect("COUNT(event.id)", "total")
      .where(overlapWhere, {
        startDate: params.startDate,
        endDate: params.endDate,
      })
      .groupBy("status.id")
      .addGroupBy("status.name")
      .getRawMany<{ id: string | number; name: string; total: string }>();

    const statusTotalsById = new Map<number, number>();
    for (const row of statusCountsRaw) {
      const id = Number(row.id);
      const total = Number(row.total);
      if (!Number.isNaN(id)) {
        statusTotalsById.set(id, Number.isNaN(total) ? 0 : total);
      }
    }

    const allStatuses = await this.eventStatusRepository.find({
      order: { name: "ASC" },
    });

    const totalsByStatus: SummaryCountItem[] = allStatuses.map((status) => ({
      id: status.id,
      name: status.name,
      total: statusTotalsById.get(status.id) ?? 0,
    }));

    const categoryCountsRaw = await this.eventRepository
      .createQueryBuilder("event")
      .leftJoin("event.category", "category")
      .select("category.id", "id")
      .addSelect("category.name", "name")
      .addSelect("COUNT(event.id)", "total")
      .where(overlapWhere, {
        startDate: params.startDate,
        endDate: params.endDate,
      })
      .groupBy("category.id")
      .addGroupBy("category.name")
      .getRawMany<{
        id: string | number | null;
        name: string | null;
        total: string;
      }>();

    const categoryTotalsById = new Map<number, number>();
    let uncategorizedTotal = 0;

    for (const row of categoryCountsRaw) {
      const total = Number(row.total);
      const safeTotal = Number.isNaN(total) ? 0 : total;

      if (row.id === null || row.id === undefined) {
        uncategorizedTotal = safeTotal;
        continue;
      }

      const id = Number(row.id);
      if (!Number.isNaN(id)) {
        categoryTotalsById.set(id, safeTotal);
      }
    }

    const allCategories = await this.categoryRepository.find({
      order: { name: "ASC" },
    });

    const totalsByCategory: SummaryCountItem[] = [
      ...allCategories.map((category) => ({
        id: category.id,
        name: category.name,
        total: categoryTotalsById.get(category.id) ?? 0,
      })),
      {
        id: null,
        name: "Sem categoria",
        total: uncategorizedTotal,
      },
    ];

    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate,
      },
      totalEvents,
      totalsByStatus,
      totalsByCategory,
    };
  }
}
