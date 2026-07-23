export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
}

export interface ErrorDetail {
  field: string;
  reason: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  version: string;
  checks: {
    database: 'connected' | 'disconnected';
  };
}
