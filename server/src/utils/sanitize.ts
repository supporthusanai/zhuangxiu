/**
 * 数据清洗和验证工具
 */

/**
 * 转义正则表达式特殊字符，防止 ReDoS 攻击
 * @param str 要转义的字符串
 * @returns 转义后的字符串
 */
export const escapeRegex = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  // 限制搜索关键词长度，防止过长的输入
  const sanitized = str.slice(0, 100);
  return sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * 验证排序字段是否在白名单中
 * @param field 排序字段
 * @param allowedFields 允许的字段列表
 * @param defaultField 默认字段
 * @returns 有效的排序字段
 */
export const validateSortField = (
  field: string | undefined,
  allowedFields: string[],
  defaultField: string = 'createdAt'
): string => {
  if (!field || !allowedFields.includes(field)) {
    return defaultField;
  }
  return field;
};

/**
 * 验证并规范化分页参数
 * @param page 页码
 * @param limit 每页数量
 * @param maxLimit 最大每页数量
 * @returns 规范化的分页参数
 */
export const validatePagination = (
  page: any,
  limit: any,
  maxLimit: number = 100
): { page: number; limit: number; skip: number } => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit, 10) || 10));
  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

/**
 * 验证 MongoDB ObjectId 格式
 * @param id 要验证的 ID
 * @returns 是否为有效的 ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export default {
  escapeRegex,
  validateSortField,
  validatePagination,
  isValidObjectId,
};
