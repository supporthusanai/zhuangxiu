import { Request } from 'express';

/**
 * 分页参数配置
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * 分页选项
 */
export interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

/**
 * 从请求中提取和验证分页参数
 *
 * @param req Express 请求对象
 * @param options 分页选项
 * @returns 验证后的分页参数
 */
export const getPaginationParams = (
  req: Request,
  options: PaginationOptions = {}
): PaginationParams => {
  const {
    defaultLimit = 10,
    maxLimit = 100,
  } = options;

  // 获取并验证 page 参数
  let page = parseInt(req.query.page as string, 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  // 获取并验证 limit 参数
  let limit = parseInt(req.query.limit as string, 10);
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  }

  // 限制最大值
  if (limit > maxLimit) {
    limit = maxLimit;
  }

  // 计算 skip
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

/**
 * 计算分页元数据
 *
 * @param page 当前页码
 * @param limit 每页数量
 * @param total 总记录数
 * @returns 分页元数据
 */
export const calculatePagination = (
  page: number,
  limit: number,
  total: number
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * 排序参数
 */
export interface SortParams {
  [key: string]: 1 | -1;
}

/**
 * 从请求中提取排序参数
 *
 * @param req Express 请求对象
 * @param allowedFields 允许排序的字段列表
 * @param defaultSort 默认排序
 * @returns MongoDB 排序对象
 */
export const getSortParams = (
  req: Request,
  allowedFields: string[] = [],
  defaultSort: SortParams = { createdAt: -1 }
): SortParams => {
  const sortBy = req.query.sortBy as string;
  const order = req.query.order as string;

  // 如果没有提供排序参数，使用默认排序
  if (!sortBy) {
    return defaultSort;
  }

  // 检查字段是否在白名单中
  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    return defaultSort;
  }

  // 验证排序方向
  const sortOrder = order === 'asc' ? 1 : -1;

  return {
    [sortBy]: sortOrder,
  };
};

/**
 * 过滤参数
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * 从请求中提取过滤参数
 *
 * @param req Express 请求对象
 * @param allowedFields 允许过滤的字段映射
 * @returns MongoDB 过滤对象
 */
export const getFilterParams = (
  req: Request,
  allowedFields: { [key: string]: 'string' | 'number' | 'boolean' | 'array' } = {}
): FilterParams => {
  const filters: FilterParams = {};

  Object.keys(allowedFields).forEach(field => {
    const value = req.query[field];

    if (value === undefined || value === null) {
      return;
    }

    const fieldType = allowedFields[field];

    switch (fieldType) {
      case 'string':
        if (typeof value === 'string' && value.trim()) {
          filters[field] = value.trim();
        }
        break;

      case 'number':
        const numValue = parseInt(value as string, 10);
        if (!isNaN(numValue)) {
          filters[field] = numValue;
        }
        break;

      case 'boolean':
        if (value === 'true' || value === '1') {
          filters[field] = true;
        } else if (value === 'false' || value === '0') {
          filters[field] = false;
        }
        break;

      case 'array':
        if (typeof value === 'string') {
          filters[field] = { $in: value.split(',').map(v => v.trim()) };
        } else if (Array.isArray(value)) {
          filters[field] = { $in: value };
        }
        break;
    }
  });

  return filters;
};
