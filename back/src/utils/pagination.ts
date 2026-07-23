import type { PaginatedResponse } from '../types/api-response.types.js';

/**
 * Calculates the SQL offset from page number and limit.
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calculates total number of pages given total items and page size.
 */
export function calculateTotalPages(total: number, limit: number): number {
  if (total === 0 || limit <= 0) return 0;
  return Math.ceil(total / limit);
}

/**
 * Builds a standardized paginated response object.
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    total,
    page,
    limit,
    totalPages: calculateTotalPages(total, limit),
    data,
  };
}
