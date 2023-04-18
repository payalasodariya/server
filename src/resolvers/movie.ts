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
import { Movie } from "../entities/Movie";
import { isAuth } from "../middleware/authentication";
import { MyContext } from "../types";
import { GraphQLError } from "graphql";

@InputType()
class MovieInput {
  @Field()
  name: string;
  @Field()
  description: string;
  @Field()
  director_name: string;
  @Field(() => Date, { nullable: true })
  release_date?: Date;
}

@ObjectType()
class PaginatedMovies {
  @Field(() => [Movie])
  movies: Movie[];
  @Field()
  hasMore: boolean;
}

@Resolver(Movie)
export class MovieResolver {
  @Query(() => PaginatedMovies)
  async movies(
    @Arg("limit", () => Int) limit: number,
    @Arg("offset", () => Int) offset: number,
    @Arg("filter", () => String) filter?: string
  ): Promise<PaginatedMovies> {
    const realLimit = Math.min(50, limit);
    const reaLimitPlusOne = realLimit + 1;

    const pagination: any[] = [`%${filter}%`, reaLimitPlusOne, offset];

    const movies = await getConnection().query(
      `
    select p.*
    from movie p
    where LOWER(name) like LOWER($1)
    OR LOWER(description) like LOWER($1)
    limit $2
    offset $3
    `,
      pagination
    );

    return {
      movies: movies.slice(0, realLimit),
      hasMore: movies.length === reaLimitPlusOne,
    };
  }

  @Query(() => Movie, { nullable: true })
  Movie(@Arg("id", () => Int) id: number): Promise<Movie | undefined> {
    return Movie.findOne(id);
  }

  @Mutation(() => Movie)
  @UseMiddleware(isAuth)
  async createMovie(
    @Arg("input") input: MovieInput,
    @Ctx() { req }: MyContext
  ): Promise<Movie> {
    return Movie.create({
      ...input,
      created_by: req.body.user_id
    }).save();
  }

  @Mutation(() => Movie, { nullable: true })
  @UseMiddleware(isAuth)
  async updateMovie(
    @Arg("id", () => Int!) id: number,
    @Arg("name") name: string,
    @Arg("description") description: string,
    @Arg("director_name") director_name: string,
    @Ctx() { req }: MyContext
  ): Promise<Movie | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Movie)
      .set({ name, description, director_name })
      .where('id = :id and "created_by" = :created_by', {
        id,
        created_by: req.body.user_id,
      })
      .returning("*")
      .execute();
    if(!result.raw[0]) {
      throw new GraphQLError('You are not allowed to update this movie')
    }
    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteMovie(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const deletedResult = await Movie.delete({ id, created_by: req.body.user_id });
    if(!deletedResult.affected) throw new GraphQLError('You are not allowed to delete this movie')
    return true;
  }
}
