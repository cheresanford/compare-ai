export default interface CreateEventoDTO {
  titulo: string;
  dataInicio: Date;
  dataTermino: Date;
  status: boolean;
  organizadorEmail: string;
  categoria?: string;
}
