import type { Technology, TechnologyFilters, PaginationParams } from '../types/technology.types.js';
import type { PaginatedResponse } from '../types/api-response.types.js';
import * as technologyRepository from '../repositories/technology.repository.js';
import { buildPaginatedResponse } from '../utils/pagination.js';

/**
 * Searches technologies with filters and pagination.
 * Caps limit at 100 if exceeded without returning an error.
 */
export async function search(
  filters: TechnologyFilters,
  pagination: PaginationParams
): Promise<PaginatedResponse<Technology>> {
  // Cap limit at 100
  const cappedLimit = Math.min(pagination.limit, 100);
  const cappedPagination = { ...pagination, limit: cappedLimit };

  const [data, total] = await Promise.all([
    technologyRepository.findByFilters(filters, cappedPagination),
    technologyRepository.count(filters),
  ]);

  return buildPaginatedResponse(data, total, cappedPagination.page, cappedLimit);
}

/**
 * Gets the detail of a single technology by ID or slug.
 */
export async function getDetail(idOrSlug: string): Promise<Technology | null> {
  return technologyRepository.findByIdOrSlug(idOrSlug);
}
