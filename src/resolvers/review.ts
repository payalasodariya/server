import {
    Arg,
    Ctx,
    Field,
    InputType,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
  } from "type-graphql";
  import { getConnection } from "typeorm";
  import { Review } from "../entities/Review";
  import { isAuth } from "../middleware/authentication";
  import { MyContext } from "../types";
  
  @InputType()
  class ReviewInput {
    @Field()
    movie_id: number;
    @Field()
    rating: number;
    @Field()
    comment: string;
  }
  
  @ObjectType()
  class PaginatedReviews {
    @Field(() => [Review])
    Reviews: Review[];
    @Field()
    hasMore: boolean;
  }
  
  @Resolver(Review)
  export class ReviewResolver {
    @Query(() => PaginatedReviews)
    async Reviews(
      @Arg("limit", () => Int) limit: number,
      @Arg("offset", () => Int) offset: number,
      @Arg("filter", () => String) filter?: string
    ): Promise<PaginatedReviews> {
      const realLimit = Math.min(50, limit);
      const reaLimitPlusOne = realLimit + 1;
  
      const pagination: any[] = [`%${filter}%`, reaLimitPlusOne, offset];
  
      const Reviews = await getConnection().query(
        `
      select r.*
      from Review r
      where LOWER(name) like LOWER($1)
      OR LOWER(description) like LOWER($1)
      limit $2
      offset $3
      `,
        pagination
      );
  
      return {
        Reviews: Reviews.slice(0, realLimit),
        hasMore: Reviews.length === reaLimitPlusOne,
      };
    }
  
    @Query(() => Review, { nullable: true })
    @UseMiddleware(isAuth)
    Review(@Arg("id", () => Int) id: number): Promise<Review | undefined> {
      return Review.findOne(id);
    }
  
    @Mutation(() => Review)
    @UseMiddleware(isAuth)
    async createReview(
      @Arg("input") input: ReviewInput,
      @Ctx() { req }: MyContext
    ): Promise<Review> {
      return Review.create({
        ...input,
        user_id: req.body.user_id
      }).save();
    }
  
    @Mutation(() => Review, { nullable: true })
    @UseMiddleware(isAuth)
    async updateReview(
      @Arg("id", () => Int!) id: number,
      @Arg("comment") comment: string,
      @Arg("rating") rating: number,
      @Ctx() { req }: MyContext
    ): Promise<Review | null> {
      const result = await getConnection()
        .createQueryBuilder()
        .update(Review)
        .set({ comment, rating})
        .where('id = :id and "user_id" = :user_id', {
          id,
          user_id: req.body.user_id,
        })
        .returning("*")
        .execute();
        console.log(result)
      return result.raw[0];
    }
  
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deleteReview(
      @Arg("id", () => Int) id: number,
      @Ctx() { req }: MyContext
    ): Promise<boolean> {
      await Review.delete({ id, user_id: req.body.user_id });
      return true;
    }
  }
  