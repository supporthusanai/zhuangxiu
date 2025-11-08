import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '装修小程序 API 文档',
      version: '1.0.0',
      description: '装修小程序后端 API 接口文档 - Express + TypeScript + MongoDB + Redis',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: '开发环境',
      },
      {
        url: 'https://api.yourdomain.com/api/v1',
        description: '生产环境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '使用 JWT Token 进行身份验证',
        },
      },
      schemas: {
        // ============ 用户相关 ============
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '用户ID' },
            openid: { type: 'string', description: '微信openid' },
            unionid: { type: 'string', description: '微信unionid' },
            phone: { type: 'string', description: '手机号' },
            nickname: { type: 'string', description: '昵称' },
            avatar: { type: 'string', description: '头像URL' },
            gender: { type: 'string', enum: ['male', 'female', 'unknown'], description: '性别' },
            region: { type: 'string', description: '地区' },
            signature: { type: 'string', description: '个性签名' },
            role: { type: 'string', enum: ['user', 'merchant', 'admin'], description: '角色' },
            isActive: { type: 'boolean', description: '是否激活' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },

        // ============ 案例相关 ============
        Case: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '案例ID' },
            title: { type: 'string', description: '标题' },
            description: { type: 'string', description: '描述' },
            style: { type: 'string', description: '风格' },
            area: { type: 'number', description: '面积（平方米）' },
            price: { type: 'number', description: '价格（元）' },
            images: { type: 'array', items: { type: 'string' }, description: '案例图片' },
            tags: { type: 'array', items: { type: 'string' }, description: '标签' },
            rooms: { type: 'string', description: '户型' },
            floor: { type: 'string', description: '楼层' },
            district: { type: 'string', description: '区域' },
            designer: { type: 'string', description: '设计师ID' },
            merchant: { type: 'string', description: '商家ID' },
            viewCount: { type: 'number', description: '浏览量' },
            favoriteCount: { type: 'number', description: '收藏数' },
            isHot: { type: 'boolean', description: '是否热门' },
            isRecommended: { type: 'boolean', description: '是否推荐' },
            status: { type: 'string', enum: ['draft', 'published', 'archived'], description: '状态' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ============ 设计师相关 ============
        Designer: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '设计师ID' },
            name: { type: 'string', description: '姓名' },
            avatar: { type: 'string', description: '头像' },
            title: { type: 'string', description: '职称' },
            experience: { type: 'number', description: '从业年限' },
            specialties: { type: 'array', items: { type: 'string' }, description: '擅长风格' },
            introduction: { type: 'string', description: '个人简介' },
            merchant: { type: 'string', description: '所属商家ID' },
            rating: { type: 'number', description: '评分' },
            caseCount: { type: 'number', description: '案例数量' },
            isActive: { type: 'boolean', description: '是否在职' },
          },
        },

        // ============ 日记相关 ============
        Diary: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '日记ID' },
            user: { type: 'string', description: '用户ID' },
            title: { type: 'string', description: '标题' },
            content: { type: 'string', description: '内容' },
            images: { type: 'array', items: { type: 'string' }, description: '图片' },
            tags: { type: 'array', items: { type: 'string' }, description: '标签' },
            progress: { type: 'number', description: '装修进度（0-100）' },
            likes: { type: 'number', description: '点赞数' },
            comments: { type: 'number', description: '评论数' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ============ 商家相关 ============
        Merchant: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '商家ID' },
            user: { type: 'string', description: '关联用户ID' },
            companyName: { type: 'string', description: '公司名称' },
            businessLicense: { type: 'string', description: '营业执照' },
            contactPerson: { type: 'string', description: '联系人' },
            contactPhone: { type: 'string', description: '联系电话' },
            address: { type: 'string', description: '地址' },
            logo: { type: 'string', description: 'Logo' },
            description: { type: 'string', description: '公司简介' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], description: '审核状态' },
            rating: { type: 'number', description: '评分' },
            caseCount: { type: 'number', description: '案例数' },
          },
        },

        // ============ 对话相关 ============
        Conversation: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '对话ID' },
            participants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string', description: '用户ID' },
                  userType: { type: 'string', enum: ['user', 'merchant', 'designer'], description: '用户类型' },
                  lastReadAt: { type: 'string', format: 'date-time', description: '最后已读时间' },
                },
              },
            },
            lastMessage: {
              type: 'object',
              properties: {
                content: { type: 'string', description: '消息内容' },
                senderId: { type: 'string', description: '发送者ID' },
                createdAt: { type: 'string', format: 'date-time', description: '发送时间' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: '消息ID' },
            conversationId: { type: 'string', description: '对话ID' },
            sender: { type: 'string', description: '发送者ID' },
            senderType: { type: 'string', enum: ['user', 'merchant', 'designer'], description: '发送者类型' },
            receiver: { type: 'string', description: '接收者ID' },
            receiverType: { type: 'string', enum: ['user', 'merchant', 'designer'], description: '接收者类型' },
            content: { type: 'string', description: '消息内容' },
            messageType: { type: 'string', enum: ['text', 'image', 'file'], description: '消息类型' },
            fileUrl: { type: 'string', description: '文件URL（图片/文件消息）' },
            isRead: { type: 'boolean', description: '是否已读' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ============ 响应格式 ============
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: '操作成功' },
            data: { type: 'object', description: '返回数据' },
          },
        },

        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: '操作失败' },
            error: { type: 'string', description: '错误详情' },
          },
        },

        PaginationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                items: { type: 'array', items: { type: 'object' } },
                total: { type: 'number', description: '总数' },
                page: { type: 'number', description: '当前页码' },
                limit: { type: 'number', description: '每页数量' },
                pages: { type: 'number', description: '总页数' },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: '认证相关接口' },
      { name: 'Cases', description: '案例相关接口' },
      { name: 'Diaries', description: '日记相关接口' },
      { name: 'Favorites', description: '收藏相关接口' },
      { name: 'Recommend', description: '推荐相关接口' },
      { name: 'Upload', description: '文件上传接口' },
      { name: 'Merchants', description: '商家相关接口' },
      { name: 'Chat', description: '聊天相关接口' },
    ],
    paths: {
      // ============ 认证接口 ============
      '/auth/wechat-login': {
        post: {
          tags: ['Auth'],
          summary: '微信登录',
          description: '使用微信授权码登录',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['code'],
                  properties: {
                    code: { type: 'string', description: '微信授权码' },
                    userInfo: { type: 'object', description: '用户信息（可选）' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: '登录成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: '登录成功' },
                      data: {
                        type: 'object',
                        properties: {
                          token: { type: 'string', description: 'JWT Token' },
                          user: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      '/auth/phone-login': {
        post: {
          tags: ['Auth'],
          summary: '手机号登录',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['phone', 'code'],
                  properties: {
                    phone: { type: 'string', description: '手机号' },
                    code: { type: 'string', description: '验证码' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: '登录成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          token: { type: 'string' },
                          user: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: '获取当前用户信息',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: '获取成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { description: '未授权' },
          },
        },
      },

      '/auth/profile': {
        put: {
          tags: ['Auth'],
          summary: '更新用户资料',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nickname: { type: 'string' },
                    avatar: { type: 'string' },
                    gender: { type: 'string', enum: ['male', 'female', 'unknown'] },
                    region: { type: 'string' },
                    signature: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: '更新成功' },
          },
        },
      },

      // ============ 案例接口 ============
      '/cases': {
        get: {
          tags: ['Cases'],
          summary: '获取案例列表',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: '页码' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: '每页数量' },
            { name: 'style', in: 'query', schema: { type: 'string' }, description: '风格筛选' },
            { name: 'minArea', in: 'query', schema: { type: 'number' }, description: '最小面积' },
            { name: 'maxArea', in: 'query', schema: { type: 'number' }, description: '最大面积' },
            { name: 'minPrice', in: 'query', schema: { type: 'number' }, description: '最小价格' },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' }, description: '最大价格' },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['createdAt', 'viewCount', 'favoriteCount'] }, description: '排序字段' },
            { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }, description: '排序方式' },
          ],
          responses: {
            200: {
              description: '获取成功',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginationResponse' },
                },
              },
            },
          },
        },
        post: {
          tags: ['Cases'],
          summary: '创建案例（商家）',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'style', 'rooms', 'images'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    style: { type: 'string' },
                    area: { type: 'number' },
                    price: { type: 'number' },
                    rooms: { type: 'string', description: '户型' },
                    floor: { type: 'string', description: '楼层' },
                    district: { type: 'string', description: '区域' },
                    images: { type: 'array', items: { type: 'string' } },
                    tags: { type: 'array', items: { type: 'string' } },
                    designer: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: '创建成功' },
            401: { description: '未授权' },
            403: { description: '权限不足' },
          },
        },
      },

      '/cases/{id}': {
        get: {
          tags: ['Cases'],
          summary: '获取案例详情',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: '案例ID' },
          ],
          responses: {
            200: {
              description: '获取成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/Case' },
                    },
                  },
                },
              },
            },
            404: { description: '案例不存在' },
          },
        },
        put: {
          tags: ['Cases'],
          summary: '更新案例（商家）',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    style: { type: 'string' },
                    area: { type: 'number' },
                    price: { type: 'number' },
                    images: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: '更新成功' },
            401: { description: '未授权' },
            403: { description: '权限不足' },
            404: { description: '案例不存在' },
          },
        },
        delete: {
          tags: ['Cases'],
          summary: '删除案例（商家）',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: '删除成功' },
            401: { description: '未授权' },
            403: { description: '权限不足' },
            404: { description: '案例不存在' },
          },
        },
      },

      '/cases/search': {
        get: {
          tags: ['Cases'],
          summary: '搜索案例',
          parameters: [
            { name: 'keyword', in: 'query', required: true, schema: { type: 'string' }, description: '搜索关键词' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: '搜索成功' },
          },
        },
      },

      '/cases/hot': {
        get: {
          tags: ['Cases'],
          summary: '获取热门案例',
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: '获取成功' },
          },
        },
      },

      // ============ 日记接口 ============
      '/diaries': {
        get: {
          tags: ['Diaries'],
          summary: '获取我的日记列表',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: '获取成功' },
            401: { description: '未授权' },
          },
        },
        post: {
          tags: ['Diaries'],
          summary: '创建日记',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'content'],
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    images: { type: 'array', items: { type: 'string' } },
                    tags: { type: 'array', items: { type: 'string' } },
                    progress: { type: 'number', minimum: 0, maximum: 100 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: '创建成功' },
            401: { description: '未授权' },
          },
        },
      },

      '/diaries/{id}': {
        get: {
          tags: ['Diaries'],
          summary: '获取日记详情',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: '获取成功' },
            401: { description: '未授权' },
            404: { description: '日记不存在' },
          },
        },
        put: {
          tags: ['Diaries'],
          summary: '更新日记',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    images: { type: 'array', items: { type: 'string' } },
                    progress: { type: 'number' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: '更新成功' },
            401: { description: '未授权' },
            403: { description: '权限不足' },
          },
        },
        delete: {
          tags: ['Diaries'],
          summary: '删除日记',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: '删除成功' },
            401: { description: '未授权' },
            403: { description: '权限不足' },
          },
        },
      },

      '/diaries/stats': {
        get: {
          tags: ['Diaries'],
          summary: '获取日记统计',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '获取成功' },
            401: { description: '未授权' },
          },
        },
      },

      // ============ 收藏接口 ============
      '/favorites': {
        get: {
          tags: ['Favorites'],
          summary: '获取我的收藏',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'targetType', in: 'query', schema: { type: 'string', enum: ['case', 'designer'] } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: '获取成功' },
            401: { description: '未授权' },
          },
        },
        post: {
          tags: ['Favorites'],
          summary: '添加收藏',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['targetType', 'targetId'],
                  properties: {
                    targetType: { type: 'string', enum: ['case', 'designer'] },
                    targetId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: '收藏成功' },
            401: { description: '未授权' },
          },
        },
      },

      '/favorites/{targetType}/{targetId}': {
        delete: {
          tags: ['Favorites'],
          summary: '取消收藏',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'targetType', in: 'path', required: true, schema: { type: 'string', enum: ['case', 'designer'] } },
            { name: 'targetId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: '取消成功' },
            401: { description: '未授权' },
          },
        },
      },

      '/favorites/check/{targetType}/{targetId}': {
        get: {
          tags: ['Favorites'],
          summary: '检查收藏状态',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'targetType', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'targetId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: '检查成功' },
            401: { description: '未授权' },
          },
        },
      },

      // ============ 推荐接口 ============
      '/recommend/cases': {
        get: {
          tags: ['Recommend'],
          summary: '获取推荐案例',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: '获取成功' },
            401: { description: '未授权' },
          },
        },
      },

      '/recommend/designers': {
        get: {
          tags: ['Recommend'],
          summary: '获取推荐设计师',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: '获取成功' },
            401: { description: '未授权' },
          },
        },
      },

      '/recommend/similar/{id}': {
        get: {
          tags: ['Recommend'],
          summary: '获取相似案例',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: '案例ID' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: '获取成功' },
            401: { description: '未授权' },
          },
        },
      },

      // ============ 上传接口 ============
      '/upload/image': {
        post: {
          tags: ['Upload'],
          summary: '上传图片',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    image: {
                      type: 'string',
                      format: 'binary',
                      description: '图片文件',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: '上传成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          url: { type: 'string', description: '图片URL' },
                          filename: { type: 'string', description: '文件名' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: '未授权' },
          },
        },
      },

      '/upload/images': {
        post: {
          tags: ['Upload'],
          summary: '批量上传图片',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    images: {
                      type: 'array',
                      items: {
                        type: 'string',
                        format: 'binary',
                      },
                      description: '图片文件数组（最多10个）',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: '上传成功' },
            401: { description: '未授权' },
          },
        },
      },

      // ============ 商家接口 ============
      '/merchants/apply': {
        post: {
          tags: ['Merchants'],
          summary: '申请成为商家',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['companyName', 'businessLicense', 'contactPerson', 'contactPhone', 'address'],
                  properties: {
                    companyName: { type: 'string' },
                    businessLicense: { type: 'string', description: '营业执照URL' },
                    contactPerson: { type: 'string' },
                    contactPhone: { type: 'string' },
                    address: { type: 'string' },
                    logo: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: '申请成功' },
            401: { description: '未授权' },
          },
        },
      },

      '/merchants/me': {
        get: {
          tags: ['Merchants'],
          summary: '获取我的商家信息',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '获取成功' },
            401: { description: '未授权' },
            404: { description: '商家不存在' },
          },
        },
        put: {
          tags: ['Merchants'],
          summary: '更新商家信息',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    companyName: { type: 'string' },
                    logo: { type: 'string' },
                    description: { type: 'string' },
                    contactPerson: { type: 'string' },
                    contactPhone: { type: 'string' },
                    address: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: '更新成功' },
            401: { description: '未授权' },
            403: { description: '权限不足' },
          },
        },
      },

      '/merchants/designers': {
        get: {
          tags: ['Merchants'],
          summary: '获取我的设计师列表',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '获取成功' },
            401: { description: '未授权' },
          },
        },
        post: {
          tags: ['Merchants'],
          summary: '添加设计师',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'avatar', 'title', 'experience', 'specialties'],
                  properties: {
                    name: { type: 'string' },
                    avatar: { type: 'string' },
                    title: { type: 'string' },
                    experience: { type: 'number' },
                    specialties: { type: 'array', items: { type: 'string' } },
                    introduction: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: '添加成功' },
            401: { description: '未授权' },
            403: { description: '权限不足' },
          },
        },
      },

      '/merchants/designers/{id}': {
        put: {
          tags: ['Merchants'],
          summary: '更新设计师',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    avatar: { type: 'string' },
                    title: { type: 'string' },
                    experience: { type: 'number' },
                    specialties: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: '更新成功' },
            401: { description: '未授权' },
            403: { description: '权限不足' },
          },
        },
        delete: {
          tags: ['Merchants'],
          summary: '删除设计师',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: '删除成功' },
            401: { description: '未授权' },
            403: { description: '权限不足' },
          },
        },
      },

      // ============ 聊天接口 ============
      '/chat/conversations': {
        get: {
          tags: ['Chat'],
          summary: '获取对话列表',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: '获取成功' },
            401: { description: '未授权' },
          },
        },
        post: {
          tags: ['Chat'],
          summary: '创建对话',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['participantId', 'participantType'],
                  properties: {
                    participantId: { type: 'string', description: '对方用户ID' },
                    participantType: { type: 'string', enum: ['user', 'merchant', 'designer'], description: '对方用户类型' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: '创建成功' },
            401: { description: '未授权' },
          },
        },
      },

      '/chat/conversations/{id}': {
        get: {
          tags: ['Chat'],
          summary: '获取对话详情',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: '获取成功' },
            401: { description: '未授权' },
            403: { description: '权限不足' },
          },
        },
        delete: {
          tags: ['Chat'],
          summary: '删除对话',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: '删除成功' },
            401: { description: '未授权' },
          },
        },
      },

      '/chat/conversations/{id}/messages': {
        get: {
          tags: ['Chat'],
          summary: '获取对话消息列表',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: '对话ID' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            200: { description: '获取成功' },
            401: { description: '未授权' },
            403: { description: '权限不足' },
          },
        },
      },

      '/chat/unread-count': {
        get: {
          tags: ['Chat'],
          summary: '获取未读消息数量',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: '获取成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          count: { type: 'number', description: '未读消息总数' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: '未授权' },
          },
        },
      },
    },
  },
  apis: [], // 已在定义中包含所有路径，无需额外扫描
};

export const swaggerSpec = swaggerJsdoc(options);
