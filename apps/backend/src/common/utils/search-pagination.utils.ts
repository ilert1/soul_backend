import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResult } from '../types/paginarted-result';

interface ArrayPaginationOptions<T> {
  items: T[];
  paginationDto: PaginationDto;
}

export function searchPaginate<T>({
  items,
  paginationDto: { page, limit },
}: ArrayPaginationOptions<T>): PaginatedResult<T> {
  // Рассчитываем индексы пагинации
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Выбираем элементы для текущей страницы
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: items.length,
    page,
    size: limit,
    pages: Math.ceil(items.length / limit),
  };
}
