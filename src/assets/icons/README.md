# TabBar 图标说明

## 图标规格

- 尺寸：81px * 81px
- 格式：PNG
- 背景：透明

## 所需图标

### 1. 首页 (home)
- `home.png` - 常规状态（灰色）
- `home-active.png` - 激活状态（蓝色/紫色）
- 图标：房子/主页图标

### 2. 案例 (case)
- `case.png` - 常规状态（灰色）
- `case-active.png` - 激活状态（蓝色/紫色）
- 图标：图片/相册图标

### 3. 设计师 (designer)
- `designer.png` - 常规状态（灰色）
- `designer-active.png` - 激活状态（蓝色/紫色）
- 图标：人物/用户图标

### 4. 我的 (mine)
- `mine.png` - 常规状态（灰色）
- `mine-active.png` - 激活状态（蓝色/紫色）
- 图标：个人中心图标

## 在线图标资源

可以从以下网站获取图标：
- [iconfont](https://www.iconfont.cn/)
- [iconpark](https://iconpark.oceanengine.com/)
- [flaticon](https://www.flaticon.com/)

## 临时方案

在开发阶段，可以注释掉 `src/app.config.ts` 中 tabBar 的 iconPath 和 selectedIconPath，
小程序将只显示文字标签。
