import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiRequest = async (method, url, data = null, token = null) => {
  try {
    let config = {
      method: method,
      url: url,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (method === 'GET' || method === 'DELETE') {
      config['params'] = data;
    } else {
      config['data'] = data;
    }

    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('Access Token expired. Refreshing token...');
      const refresh_token = Cookies.get('refreshToken');

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/refresh-token/`,
          null,
          {
            headers: {
              Authorization: `Bearer ${refresh_token}`,
            },
          }
        );
        if (refreshResponse) {
          const newAccessToken = refreshResponse.data.accessToken;
          const newRefreshToken = refreshResponse.data.refreshToken;

          Cookies.set('accessToken', newAccessToken, {
            expires: 1,
            secure: true,
            sameSite: 'None',
          });
          Cookies.set('refreshToken', newRefreshToken, {
            expires: 7,
            secure: true,
            sameSite: 'None',
          });

          const retryResponse = await axiosInstance({
            method: method,
            url: url,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newAccessToken}`,
            },
            params: method === 'GET' || method === 'DELETE' ? data : null,
            data: method === 'POST' || method === 'PUT' || method === 'PATCH' ? data : null,
          });

          console.log('Retried request:', retryResponse.data);
          return retryResponse.data;
        }
      } catch (refreshError) {
        console.clear();
        window.location.href='/login'
      }
    } else {
      console.error('API Request Error:', error.response.data);
      throw error.response.data;
    }
  }
};

export const get = async (url, token, params={}) => {
  return apiRequest('GET', url, params, token);
};

export const post = async (url, token, data = {}) => {
  return apiRequest('POST', url, data, token);
};

export const put = async (url, token, data = {}) => {
  return apiRequest('PUT', url, data, token);
};

export const del = async (url, token, params = {}) => {
  return apiRequest('DELETE', url, params, token);
};

export const patch = async (url, token, data = {}) => {
  return apiRequest('PATCH', url, data, token);
};
