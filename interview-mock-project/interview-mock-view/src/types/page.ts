export type PageResult<T> = {
  records: T[];
  total: number;
  current: number;
  size: number;
};
