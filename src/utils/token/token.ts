import jwt from "jsonwebtoken";

export type TokenPayload = jwt.JwtPayload & Record<string, unknown>;

export const generateToken = (payload: object, secret: string, options: jwt.SignOptions): string => {
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
  return token;
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded as TokenPayload;
  } catch {
    return null;
  }
};

export const refreshToken = (payload: object): string => {
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
  return token;
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    );
    return decoded as TokenPayload;
  } catch {
    return null;
  }
};