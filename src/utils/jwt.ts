import jwt from "jsonwebtoken";
import config from "../config";

export const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      subscriptionType: user.subscriptionType,
    },
    config.jwt_secret as string,
    {
      expiresIn: "7d",
    },
  );
};
