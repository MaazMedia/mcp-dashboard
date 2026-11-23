export type AppKind = "adsiq" | "bpiq";

export type Metric = {
  label: string;
  value: string;
  delta?: number;
};

export type TrendPoint = { date: string; value: number };

export type ActivityItem = {
  id: string;
  at: string;
  title: string;
  kind: "prediction" | "status" | "submission" | "usage" | "report" | "payment";
};

export type DashboardPayload = {
  app: AppKind;
  slug: string;
  client: { name: string; email: string };
  metrics: Metric[];
  trend: TrendPoint[];
  activity: ActivityItem[];
};
