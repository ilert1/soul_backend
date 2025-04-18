export interface PaginatedResult<T> {
  items: Array<T>;
  total: number;
  page: number;
  size: number;
  pages: number;
}
