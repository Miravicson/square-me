import { Request } from 'express';
import { JwtFromRequestFunction } from 'passport-jwt';

export function fromCookieAsJwt(cookieKey): JwtFromRequestFunction {
  return (req: Request) => {
    let accessToken: string | null = null;
    if (req && req.cookies) {
      accessToken = req.cookies[cookieKey] as string;
    }
    return accessToken;
  };
}
