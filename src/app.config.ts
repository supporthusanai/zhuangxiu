export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/cases/index',
    'pages/designers/index',
    'pages/mine/index',
    'pages/case-detail/index',
    'pages/designer-detail/index',
    'pages/login/index',
    'pages/profile-edit/index',
    'pages/search/index',
    'pages/diary/index',
    'pages/diary-edit/index',
    'pages/merchant-apply/index',
    'pages/merchant-center/index',
    'pages/merchant-cases/index',
    'pages/case-edit/index',
    'pages/inquiries/index',
    'pages/chat/index',
    'pages/my-consultations/index',
    'pages/my-favorites/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '装修小程序',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#666',
    selectedColor: '#1890ff',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/cases/index',
        text: '案例',
        iconPath: 'assets/icons/case.png',
        selectedIconPath: 'assets/icons/case-active.png'
      },
      {
        pagePath: 'pages/designers/index',
        text: '设计师',
        iconPath: 'assets/icons/designer.png',
        selectedIconPath: 'assets/icons/designer-active.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/icons/mine.png',
        selectedIconPath: 'assets/icons/mine-active.png'
      }
    ]
  }
})
