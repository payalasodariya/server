import {
  Resolver,
  Mutation,
  Arg,
  Field,
  ObjectType
} from "type-graphql";
import { User } from "../entities/User";
import { hash, verify } from "argon2";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { sendEmail } from "../utils/sendEmail";
import { getConnection } from "typeorm";
import { signToken, verifyToken } from "../utils/token";
import { validateChangePassword, validateRegister } from "../utils/validateEmailPassword";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => String, { nullable: true })
  token?: String;
}

@Resolver(User)
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput
  ): Promise<UserResponse> {
    try {
      await validateRegister(options)
      const hashedPassword = await hash(options.password);
      let user;
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          name: options.name,
          email: options.email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
      return { user };

    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      } else {
        return err
      }
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username doesn't exist",
          },
        ],
      };
    }
    const valid = await verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    return {
      user,
      token: signToken(user.id)
    };
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string
  ): Promise<UserResponse> {
    try {
      await validateChangePassword(newPassword);
      const userId = verifyToken(token);

      if (!userId) {
        return {
          errors: [
            {
              field: "token",
              message: "user no longer exists",
            },
          ],
        };
      }

      await User.update(
        { id: userId },
        {
          password: await hash(newPassword),
        }
      );
      return {};
    } catch (err) {
      return err
    }
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // the email is not in the db
      return true;
    }

    const token = signToken(user.id);

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }
}
