import { body, param, query, ValidationChain } from 'express-validator';

/**
 * 通用验证规则
 */

// 手机号验证
export const validatePhone = () =>
  body('phone')
    .trim()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('手机号格式不正确');

// 验证码验证
export const validateCode = () =>
  body('code')
    .trim()
    .isLength({ min: 4, max: 6 })
    .withMessage('验证码格式不正确');

// ObjectId 验证
export const validateObjectId = (field: string = 'id') =>
  param(field)
    .isMongoId()
    .withMessage(`${field} 必须是有效的ID`);

/**
 * 认证相关验证
 */

// 微信登录验证
export const validateWechatLogin: ValidationChain[] = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('code 不能为空'),
  body('userInfo.nickname')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('昵称最多50个字符'),
];

// 手机号登录验证
export const validatePhoneLogin: ValidationChain[] = [
  validatePhone(),
  validateCode(),
];

// 更新用户资料验证
export const validateUpdateProfile: ValidationChain[] = [
  body('nickname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('昵称长度应在1-50个字符之间'),
  body('avatar')
    .optional()
    .trim()
    .isURL()
    .withMessage('头像必须是有效的URL'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'unknown'])
    .withMessage('性别必须是 male, female 或 unknown'),
  body('region')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('地区最多100个字符'),
  body('signature')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('个性签名最多200个字符'),
];

/**
 * 案例相关验证
 */

// 创建案例验证
export const validateCreateCase: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('标题不能为空')
    .isLength({ max: 100 })
    .withMessage('标题最多100个字符'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('描述不能为空')
    .isLength({ max: 2000 })
    .withMessage('描述最多2000个字符'),
  body('style')
    .isIn(['现代简约', '北欧', '中式', '新中式', '欧式', '美式', '工业', '地中海', '日式', '轻奢', '田园', '混搭'])
    .withMessage('装修风格不正确'),
  body('area')
    .isFloat({ min: 10, max: 10000 })
    .withMessage('面积必须在10-10000平方米之间'),
  body('budget')
    .isFloat({ min: 0 })
    .withMessage('预算必须是正数'),
  body('images')
    .isArray({ min: 1, max: 20 })
    .withMessage('图片数量应在1-20张之间'),
  body('images.*')
    .isURL()
    .withMessage('图片必须是有效的URL'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('标签最多10个'),
];

// 更新案例验证
export const validateUpdateCase: ValidationChain[] = [
  validateObjectId(),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('标题长度应在1-100个字符之间'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('描述长度应在1-2000个字符之间'),
  body('style')
    .optional()
    .isIn(['现代简约', '北欧', '中式', '新中式', '欧式', '美式', '工业', '地中海', '日式', '轻奢', '田园', '混搭'])
    .withMessage('装修风格不正确'),
  body('area')
    .optional()
    .isFloat({ min: 10, max: 10000 })
    .withMessage('面积必须在10-10000平方米之间'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('预算必须是正数'),
];

// 搜索案例验证
export const validateSearchCases: ValidationChain[] = [
  query('keyword')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('关键词最多100个字符'),
  query('style')
    .optional()
    .isIn(['现代简约', '北欧', '中式', '新中式', '欧式', '美式', '工业', '地中海', '日式', '轻奢', '田园', '混搭'])
    .withMessage('装修风格不正确'),
  query('minArea')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('最小面积必须是正数'),
  query('maxArea')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('最大面积必须是正数'),
  query('minBudget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('最小预算必须是正数'),
  query('maxBudget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('最大预算必须是正数'),
];

/**
 * 日记相关验证
 */

// 创建日记验证
export const validateCreateDiary: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('标题不能为空')
    .isLength({ max: 100 })
    .withMessage('标题最多100个字符'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('内容不能为空')
    .isLength({ max: 5000 })
    .withMessage('内容最多5000个字符'),
  body('progress')
    .isInt({ min: 0, max: 100 })
    .withMessage('进度必须在0-100之间'),
  body('images')
    .optional()
    .isArray({ max: 9 })
    .withMessage('图片最多9张'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('标签最多10个'),
];

/**
 * 收藏相关验证
 */

// 添加收藏验证
export const validateAddFavorite: ValidationChain[] = [
  body('targetType')
    .isIn(['case', 'designer'])
    .withMessage('收藏类型必须是 case 或 designer'),
  body('targetId')
    .isMongoId()
    .withMessage('目标ID格式不正确'),
];

/**
 * 商家相关验证
 */

// 商家申请验证
export const validateMerchantApply: ValidationChain[] = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('公司名称不能为空')
    .isLength({ max: 100 })
    .withMessage('公司名称最多100个字符'),
  body('businessLicense')
    .trim()
    .notEmpty()
    .withMessage('营业执照号不能为空')
    .isLength({ max: 50 })
    .withMessage('营业执照号最多50个字符'),
  body('contactPerson')
    .trim()
    .notEmpty()
    .withMessage('联系人不能为空')
    .isLength({ max: 50 })
    .withMessage('联系人姓名最多50个字符'),
  body('contactPhone')
    .trim()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('联系电话格式不正确'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('地址不能为空')
    .isLength({ max: 200 })
    .withMessage('地址最多200个字符'),
];

/**
 * 分页验证
 */
export const validatePagination: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),
  query('sortBy')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('排序字段最多50个字符'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('排序方向必须是 asc 或 desc'),
];
