import { Router } from 'express';
import {
  healthCheck,
  ping,
  readiness,
  liveness,
} from '../controllers/healthController';

const router = Router();

/**
 * 健康检查路由
 * 这些端点不需要认证，也不受限流影响
 */

// GET /health - 完整健康检查
router.get('/health', healthCheck);

// GET /ping - 简单 ping
router.get('/ping', ping);

// GET /ready - 就绪检查（Kubernetes）
router.get('/ready', readiness);

// GET /alive - 存活检查（Kubernetes）
router.get('/alive', liveness);

export default router;
