export enum FixType {
  Skipped = 1,
  NotPossible = 1,
  Possible = 2,
  Fixed = 3,
}

export type FixResult = {
  type: FixType;
  message?: string;
};
