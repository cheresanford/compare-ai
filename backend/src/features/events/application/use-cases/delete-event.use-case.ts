import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  EVENTS_COMMAND_REPOSITORY,
  EventsCommandRepository,
} from "../../domain/interfaces/events-command.repository.interface";

@Injectable()
export class DeleteEventUseCase {
  constructor(
    @Inject(EVENTS_COMMAND_REPOSITORY)
    private readonly eventsCommandRepository: EventsCommandRepository,
  ) {}

  async execute(eventId: number, confirm: boolean) {
    if (!confirm) {
      throw new BadRequestException(
        "Confirmação obrigatória. Envie confirm=true para excluir o evento.",
      );
    }

    const existing = await this.eventsCommandRepository.findById(eventId);

    if (!existing) {
      throw new NotFoundException("Evento não encontrado.");
    }

    await this.eventsCommandRepository.delete(eventId);

    return { deleted: true, id: eventId };
  }
}
