import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types";
import { verifyToken } from "../utils/token";

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!context.req.headers.token) {
    throw new Error("not authenticated");
  }
  const userId = await verifyToken(String(context.req.headers.token));
  context.req.body.user_id = userId;
  return next();
};
