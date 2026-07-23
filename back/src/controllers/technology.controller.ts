import type { Request, Response, NextFunction } from 'express';
import * as technologyService from '../services/technology.service.js';
import type { SearchQueryParams } from '../middlewares/validation.middleware.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Search technologies with filters and pagination.
 */
export async function searchTechnologies(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = (req as Request & { validatedQuery: SearchQueryParams }).validatedQuery;

    const filters = {
      query: query.query,
      type: query.type,
      category: query.category,
      language: query.language,
      sort: query.sort,
    };

    const pagination = {
      page: query.page,
      limit: query.limit,
    };

    const result = await technologyService.search(filters, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get technology detail by ID or slug.
 */
export async function getTechnologyDetail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { idOrSlug } = req.params;
    const technology = await technologyService.getDetail(idOrSlug);

    if (!technology) {
      throw new NotFoundError(`Tecnología no encontrada: ${idOrSlug}`);
    }

    // Build response with "aprende_en_10_minutos" section
    const response = {
      ...technology,
      aprende_en_10_minutos: {
        que_es: technology.que_es,
        caso_uso_principal: technology.caso_uso_principal,
        comando_instalacion: technology.comando_instalacion,
        ejemplo_helloworld: technology.ejemplo_helloworld,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
