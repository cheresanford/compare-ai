export interface EventsSummaryReportParams {
  startDate: Date;
  endDate: Date;
}

export interface SummaryCountItem {
  id: number | null;
  name: string;
  total: number;
}

export interface EventsSummaryReportResult {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalEvents: number;
  totalsByStatus: SummaryCountItem[];
  totalsByCategory: SummaryCountItem[];
}

export const EVENTS_REPORT_REPOSITORY = Symbol("EVENTS_REPORT_REPOSITORY");

export interface EventsReportRepository {
  getSummary(
    params: EventsSummaryReportParams,
  ): Promise<EventsSummaryReportResult>;
}
