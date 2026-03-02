import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CreateEventDto } from "../dtos/create-event.dto";
import {
  EVENTS_COMMAND_REPOSITORY,
  EventsCommandRepository,
} from "../../domain/interfaces/events-command.repository.interface";

@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(EVENTS_COMMAND_REPOSITORY)
    private readonly eventsCommandRepository: EventsCommandRepository,
  ) {}

  async execute(dto: CreateEventDto) {
    this.validateDates(dto.startDate, dto.endDate);

    if (!dto.statusId && !dto.status) {
      throw new BadRequestException("Informe statusId ou status.");
    }

    const normalizedStatus = dto.status?.trim().toLowerCase();
    const normalizedEmail = dto.organizerEmail.trim().toLowerCase();

    if (dto.statusId) {
      const statusExistsById =
        await this.eventsCommandRepository.statusExistsById(dto.statusId);

      if (!statusExistsById) {
        throw new BadRequestException("Status de evento invalido.");
      }
    }

    if (normalizedStatus) {
      const statusExists =
        await this.eventsCommandRepository.statusExists(normalizedStatus);

      if (!statusExists) {
        throw new BadRequestException("Status de evento invalido.");
      }
    }

    if (dto.categoryId) {
      const categoryExists = await this.eventsCommandRepository.categoryExists(
        dto.categoryId,
      );

      if (!categoryExists) {
        throw new BadRequestException("Categoria informada nao existe.");
      }
    }

    const hasConflict = await this.eventsCommandRepository.hasTimeConflict(
      normalizedEmail,
      dto.startDate,
      dto.endDate,
    );

    if (hasConflict) {
      throw new BadRequestException(
        "Horario em conflito para este organizador.",
      );
    }

    return this.eventsCommandRepository.create({
      title: dto.title.trim(),
      startDate: dto.startDate,
      endDate: dto.endDate,
      location: dto.location.trim(),
      organizerName: dto.organizerName.trim(),
      organizerEmail: normalizedEmail,
      statusId: dto.statusId,
      status: normalizedStatus,
      categoryId: dto.categoryId,
    });
  }

  private validateDates(startDate: Date, endDate: Date) {
    if (endDate.getTime() <= startDate.getTime()) {
      throw new BadRequestException(
        "A data de termino deve ser maior que a data de inicio.",
      );
    }
  }
}
