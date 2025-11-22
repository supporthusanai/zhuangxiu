import type { UserConfigExport } from '@tarojs/cli'

export default {
  logger: {
    quiet: false,
    stats: true
  },
  mini: {},
  h5: {
    devServer: {
      port: 10086,
      host: 'localhost',
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          pathRewrite: {
            // 不需要重写路径，因为后端已经使用 /api/v1 作为基础路径
          }
        }
      }
    }
  }
} satisfies UserConfigExport
