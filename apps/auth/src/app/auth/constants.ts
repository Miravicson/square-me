export type JWTStrategyNames = Lowercase<keyof typeof AuthStrategyName>;
export const AuthStrategyName = {
  JWT: 'jwt',
  LOCAL: 'local',
  JWT_REFRESH: 'jwt-refresh',
} as const;
export const AuthCookieName = 'Authentication';

export const AuthCookieKey = {
  JWT_TOKEN: 'jwt-token',
  JWT_REFRESH_TOKEN: 'refresh-token',
} as const;
