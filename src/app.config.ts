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
        iconPath: 'assets/icons/home.svg',
        selectedIconPath: 'assets/icons/home-active.svg'
      },
      {
        pagePath: 'pages/cases/index',
        text: '案例',
        iconPath: 'assets/icons/case.svg',
        selectedIconPath: 'assets/icons/case-active.svg'
      },
      {
        pagePath: 'pages/designers/index',
        text: '设计师',
        iconPath: 'assets/icons/designer.svg',
        selectedIconPath: 'assets/icons/designer-active.svg'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/icons/mine.svg',
        selectedIconPath: 'assets/icons/mine-active.svg'
      }
    ]
  }
})
