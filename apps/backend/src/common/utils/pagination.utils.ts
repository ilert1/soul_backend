import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResult } from '../types/paginarted-result';

interface PaginationProperties<T> {
  prisma: PrismaService;
  model: string;
  paginationDto: PaginationDto;
  options?: PaginationOptions<T>;
}

interface PaginationOptions<T> {
  include?: Record<string, boolean | Record<string, any>>;
  excludeFields?: string[];
  where?: Record<string, any>;
  select?: Record<string, any>;
  order?:
    | Record<string, 'asc' | 'desc'>
    | Array<{ [key: string]: 'asc' | 'desc' }>;
  searchQuery?: string;
  searchFields?: (keyof T)[];
}

export async function paginate<T>({
  prisma,
  model,
  paginationDto: { page, limit },
  options,
}: PaginationProperties<T>): Promise<PaginatedResult<T>> {
  const {
    include,
    excludeFields = [],
    where = {},
    order,
    select,
    searchQuery,
    searchFields,
  } = options || {};

  const skip = (page - 1) * limit;
  const take = limit;

  // Добавляем поиск по полям, если есть searchQuery и searchFields
  const finalWhere = { ...where };

  if (searchQuery && searchFields && searchFields.length > 0) {
    finalWhere.OR = searchFields.map((field) => ({
      [field]: {
        contains: searchQuery,
        mode: 'insensitive', // для case-insensitive поиска
      },
    }));
  }

  // Преобразуем order в нужный формат
  let orderBy: { [key: string]: 'asc' | 'desc' }[] | undefined;

  if (Array.isArray(order)) {
    orderBy = order.map((item) => {
      const key = Object.keys(item)[0];

      return { [key]: item[key] };
    });
  } else if (order) {
    orderBy = [order];
  }

  const [items, total] = await Promise.all([
    prisma[model].findMany({
      skip,
      take,
      where: finalWhere,
      orderBy: orderBy,
      include,
      select,
    }),
    prisma[model].count({
      where: finalWhere,
    }),
  ]);

  const pages = Math.ceil(total / limit);

  const filteredItems = items.map((item) => {
    const filteredItem = { ...item };
    excludeFields.forEach((field) => {
      delete filteredItem[field];
    });

    return filteredItem;
  });

  return {
    items: filteredItems,
    total,
    page,
    size: limit,
    pages,
  };
}
