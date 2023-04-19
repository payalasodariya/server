import jwt from "jsonwebtoken";

export const signToken = (data: number) => {
    return jwt.sign(String(data), process.env.JWT_SECRET);
};

export const verifyToken = (token: string) => {
    return Number(jwt.verify(token, process.env.JWT_SECRET));
};