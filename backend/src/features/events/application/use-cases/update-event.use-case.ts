import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UpdateEventDto } from "../dtos/update-event.dto";
import {
  EVENTS_COMMAND_REPOSITORY,
  EventsCommandRepository,
  SaveEventPayload,
} from "../../domain/interfaces/events-command.repository.interface";

@Injectable()
export class UpdateEventUseCase {
  constructor(
    @Inject(EVENTS_COMMAND_REPOSITORY)
    private readonly eventsCommandRepository: EventsCommandRepository,
  ) {}

  async execute(eventId: number, dto: UpdateEventDto) {
    const currentEvent = await this.eventsCommandRepository.findById(eventId);

    if (!currentEvent) {
      throw new NotFoundException("Evento não encontrado.");
    }

    const nextStartDate = dto.startDate ?? currentEvent.startDate;
    const nextEndDate = dto.endDate ?? currentEvent.endDate;
    this.validateDates(nextStartDate, nextEndDate);

    const nextStatusId = dto.statusId ?? currentEvent.statusId;
    const nextStatus = (dto.status ?? currentEvent.status)
      ?.trim()
      .toLowerCase();

    const statusExistsById =
      await this.eventsCommandRepository.statusExistsById(nextStatusId);

    if (!statusExistsById) {
      throw new BadRequestException("Status de evento inválido.");
    }

    if (nextStatus) {
      const statusExists =
        await this.eventsCommandRepository.statusExists(nextStatus);

      if (!statusExists) {
        throw new BadRequestException("Status de evento inválido.");
      }
    }

    const hasOverlappingTime =
      await this.eventsCommandRepository.areEventsOverlapping(dto);
    if (hasOverlappingTime) {
      throw new ConflictException(
        "Não é possível editar para uma data que já há eventos!",
      );
    }

    const nextCategoryId =
      dto.categoryId === null
        ? null
        : (dto.categoryId ?? currentEvent.categoryId ?? null);
    if (nextCategoryId) {
      const categoryExists =
        await this.eventsCommandRepository.categoryExists(nextCategoryId);

      if (!categoryExists) {
        throw new BadRequestException("Categoria informada não existe.");
      }
    }

    const payload: SaveEventPayload = {
      title: dto.title?.trim() ?? currentEvent.title,
      startDate: nextStartDate,
      endDate: nextEndDate,
      location: dto.location?.trim() ?? currentEvent.location,
      organizerName: dto.organizerName?.trim() ?? currentEvent.organizer.name,
      organizerEmail:
        dto.organizerEmail?.trim().toLowerCase() ??
        currentEvent.organizer.email,
      statusId: nextStatusId,
      status: nextStatus,
      categoryId: nextCategoryId,
    };

    return this.eventsCommandRepository.update(eventId, payload);
  }

  private validateDates(startDate: Date, endDate: Date) {
    if (endDate.getTime() <= startDate.getTime()) {
      throw new BadRequestException(
        "A data de término deve ser maior que a data de início.",
      );
    }
  }
}
