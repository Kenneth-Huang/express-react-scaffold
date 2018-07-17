import { createBrowserHistory } from 'history';
import axios from 'axios';
import swal from 'sweetalert';

axios.defaults.baseURL = '/api'; // 设置基础url为 /api
axios.defaults.timeout = 5000; // 设置超时时间为5s

const history = createBrowserHistory();

// 拦截请求，给所有的请求都带上token
axios.interceptors.request.use(request => {
  const luffy_jwt_token = window.localStorage.getItem('luffy_jwt_token');
  if (luffy_jwt_token) {
    /*
      此处有坑，在此记录
      request.headers['Authorization']
      必须通过此种形式设置Authorization,否则后端即使收到字段也会出现问题，返回401
      - request.headers.Authorization或request.headers.authorization可以设置成功，
      浏览器查看也没有任何问题，但是在后端会报401并且后端一律只能拿到小写的，
      也就是res.headers.authorization，后端用大写获取会报undefined
    */
    request.headers['Authorization'] =`Bearer ${luffy_jwt_token}`;
  }
  return request;
});

// 拦截响应，遇到token不合法则报错
axios.interceptors.response.use(
  response => {
    if (response.data.token) {
      console.log('token:', response.data.token);
      window.localStorage.setItem('luffy_jwt_token', response.data.token);
    }
    return response;
  },
  error => {
    const errRes = error.response;
    if (errRes.status === 401) {
      window.localStorage.removeItem('luffy_jwt_token');
      swal('Auth Error!', `${errRes.data.error.message}, please login!`, 'error')
      .then(() => {
        history.push('/login');
        setTimeout(() => {
          window.location.reload();
        }, 0);
      });
    } else {
      swal('Error', `${error.message}`, 'error');
    }
    return Promise.reject(error.message);   // 返回接口返回的错误信息
  });

export default class http {
  static get(url, params) {
    return new Promise((resolve, reject) => {
      axios.get(url, {
        params: params
      }).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });
    });
  }

  static post(url, body) {
    return new Promise((resolve, reject) => {
      axios.post(url, body)
        .then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        });
    });
  }
}