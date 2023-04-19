CREATE TABLE "review"
(
	"id" SERIAL NOT NULL,
	"movie_id" int NOT NULL,
	"user_id" int NOT NULL,
	"rating" int NOT NULL,
	"comment" character varying NOT NULL,
	"created_at" TIMESTAMP NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
 	PRIMARY KEY ("id"),
	CONSTRAINT FK_movie_review FOREIGN KEY(movie_id) REFERENCES "movie" (id),
	CONSTRAINT FK_user_review FOREIGN KEY(user_id) REFERENCES "user" (id)
);
