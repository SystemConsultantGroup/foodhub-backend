// .env 내 환경변수 등록
export default () => ({
  app: {
    env: process.env.APP_ENV,
    port: parseInt(process.env.APP_PORT),
    baseUrl: process.env.APP_BASE_URL,
    root: process.env.PWD,
    domain: process.env.APP_DOMAIN,
  },
  fe: {
    baseUrl: process.env.FE_BASE_URL,
  },
  kakao: {
    clientID: process.env.KAKAO_CLIENT_ID,
    callbackURI: process.env.KAKAO_CALLBACK_URI,
    logoutRedirectURI: process.env.KAKAO_LOGOUT_REDIRECT_URI,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
});
