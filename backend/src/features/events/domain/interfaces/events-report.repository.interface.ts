export type SummaryCountItem = {
  id: number | null;
  name: string;
  total: number;
};

export type EventsSummaryResult = {
  total: number;
  totalsByStatus: SummaryCountItem[];
  totalsByCategory: SummaryCountItem[];
};

export const EVENTS_REPORT_REPOSITORY = Symbol("EVENTS_REPORT_REPOSITORY");

export interface EventsReportRepository {
  getSummary(params: {
    startDate: Date;
    endDate: Date;
  }): Promise<EventsSummaryResult>;
}
