export type ApiHealthData = {
  status: "online" | "maintenance";
};

export type ValidationError = Record<string, string[]>;
