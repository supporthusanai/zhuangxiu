import axios from 'axios';
import logger from '../config/logger';

interface WeChatLoginResponse {
  openid?: string;
  session_key?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface WeChatUserInfo {
  openId: string;
  nickName?: string;
  gender?: number;
  language?: string;
  city?: string;
  province?: string;
  country?: string;
  avatarUrl?: string;
  unionId?: string;
}

// 微信小程序登录
export const wechatLogin = async (code: string): Promise<WeChatLoginResponse> => {
  try {
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error('微信配置未设置');
    }

    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const params = {
      appid: appId,
      secret: appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    };

    const response = await axios.get<WeChatLoginResponse>(url, { params });

    if (response.data.errcode) {
      throw new Error(response.data.errmsg || '微信登录失败');
    }

    return response.data;
  } catch (error) {
    logger.error('微信登录错误', error);
    throw error;
  }
};

// 获取微信小程序 Access Token
export const getAccessToken = async (): Promise<string> => {
  try {
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error('微信配置未设置');
    }

    const url = 'https://api.weixin.qq.com/cgi-bin/token';
    const params = {
      grant_type: 'client_credential',
      appid: appId,
      secret: appSecret,
    };

    const response = await axios.get(url, { params });

    if (response.data.errcode) {
      throw new Error(response.data.errmsg || '获取 Access Token 失败');
    }

    return response.data.access_token;
  } catch (error) {
    logger.error('获取 Access Token 错误', error);
    throw error;
  }
};

// 发送订阅消息
export const sendSubscribeMessage = async (
  openid: string,
  templateId: string,
  data: any,
  page?: string
): Promise<boolean> => {
  try {
    const accessToken = await getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;

    const payload = {
      touser: openid,
      template_id: templateId,
      page: page || 'pages/index/index',
      data,
    };

    const response = await axios.post(url, payload);

    if (response.data.errcode !== 0) {
      throw new Error(response.data.errmsg || '发送消息失败');
    }

    return true;
  } catch (error) {
    logger.error('发送订阅消息错误', error);
    return false;
  }
};

// 获取手机号
export const getPhoneNumber = async (code: string): Promise<string | null> => {
  try {
    const accessToken = await getAccessToken();
    const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;

    const response = await axios.post(url, { code });

    if (response.data.errcode !== 0) {
      throw new Error(response.data.errmsg || '获取手机号失败');
    }

    return response.data.phone_info?.phoneNumber || null;
  } catch (error) {
    logger.error('获取手机号错误', error);
    return null;
  }
};
