import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';

// 验证结果处理中间件
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: '参数验证失败',
      errors: errors.array().map((err) => ({
        field: (err as any).path || (err as any).param,
        message: err.msg,
      })),
    });
    return;
  }
  next();
};

// 验证规则工厂函数
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    handleValidationErrors(req, res, next);
  };
};

// ============ 认证相关验证 ============

export const validateWechatLogin = [
  body('code')
    .notEmpty()
    .withMessage('code 不能为空')
    .isString()
    .withMessage('code 必须是字符串'),
];

export const validatePhoneLogin = [
  body('phone')
    .notEmpty()
    .withMessage('手机号不能为空')
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('手机号格式不正确'),
  body('code')
    .notEmpty()
    .withMessage('验证码不能为空')
    .isLength({ min: 4, max: 6 })
    .withMessage('验证码长度应为4-6位'),
];

export const validateUpdateProfile = [
  body('nickname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('昵称长度应在1-50个字符之间'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('头像必须是有效的URL'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'unknown'])
    .withMessage('性别值无效'),
  body('signature')
    .optional()
    .isLength({ max: 200 })
    .withMessage('个性签名最多200个字符'),
];

// ============ 案例相关验证 ============

export const validateCreateCase = [
  body('title')
    .notEmpty()
    .withMessage('标题不能为空')
    .trim()
    .isLength({ max: 100 })
    .withMessage('标题最多100个字符'),
  body('style')
    .notEmpty()
    .withMessage('风格不能为空')
    .isIn([
      '现代简约', '北欧风格', '中式风格', '新中式', '欧式古典',
      '美式风格', '工业风格', '地中海', '日式风格', '轻奢风格',
      '田园风格', '混搭风格',
    ])
    .withMessage('无效的风格类型'),
  body('area')
    .notEmpty()
    .withMessage('面积不能为空')
    .isFloat({ min: 0 })
    .withMessage('面积必须是正数'),
  body('price')
    .notEmpty()
    .withMessage('价格不能为空')
    .isFloat({ min: 0 })
    .withMessage('价格必须是正数'),
  body('images')
    .isArray({ min: 1, max: 20 })
    .withMessage('图片数量应在1-20张之间'),
  body('description')
    .notEmpty()
    .withMessage('描述不能为空')
    .isLength({ max: 2000 })
    .withMessage('描述最多2000个字符'),
  body('rooms')
    .notEmpty()
    .withMessage('户型不能为空'),
  body('designer')
    .notEmpty()
    .withMessage('设计师不能为空')
    .isMongoId()
    .withMessage('无效的设计师ID'),
];

export const validateUpdateCase = [
  param('id')
    .isMongoId()
    .withMessage('无效的案例ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('标题最多100个字符'),
  body('area')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('面积必须是正数'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('价格必须是正数'),
];

// ============ 收藏相关验证 ============

export const validateAddFavorite = [
  body('targetType')
    .notEmpty()
    .withMessage('收藏类型不能为空')
    .isIn(['case', 'designer'])
    .withMessage('无效的收藏类型'),
  body('targetId')
    .notEmpty()
    .withMessage('目标ID不能为空')
    .isMongoId()
    .withMessage('无效的目标ID'),
];

// ============ 日记相关验证 ============

export const validateCreateDiary = [
  body('title')
    .notEmpty()
    .withMessage('标题不能为空')
    .trim()
    .isLength({ max: 100 })
    .withMessage('标题最多100个字符'),
  body('content')
    .notEmpty()
    .withMessage('内容不能为空')
    .isLength({ max: 5000 })
    .withMessage('内容最多5000个字符'),
  body('images')
    .optional()
    .isArray({ max: 9 })
    .withMessage('图片最多9张'),
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('进度应在0-100之间'),
];

// ============ 商家相关验证 ============

export const validateMerchantApply = [
  body('companyName')
    .notEmpty()
    .withMessage('公司名称不能为空')
    .trim()
    .isLength({ max: 100 })
    .withMessage('公司名称最多100个字符'),
  body('businessLicense')
    .notEmpty()
    .withMessage('营业执照不能为空'),
  body('contactPerson')
    .notEmpty()
    .withMessage('联系人不能为空'),
  body('contactPhone')
    .notEmpty()
    .withMessage('联系电话不能为空')
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('联系电话格式不正确'),
  body('address')
    .notEmpty()
    .withMessage('地址不能为空'),
];

// ============ 分页验证 ============

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量应在1-100之间'),
];

// ============ ID 验证 ============

export const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('无效的ID格式'),
];
