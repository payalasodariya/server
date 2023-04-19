CREATE TABLE "movie"
(
	"id" SERIAL NOT NULL, 
	"name" character varying NOT NULL, 
	"description" character varying NOT NULL, 
	"director_name" character varying NOT NULL,
	"release_date" TIMESTAMP,
	"created_by" int NOT NULL,
	"created_at" TIMESTAMP NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
 	PRIMARY KEY ("id"),
	CONSTRAINT FK_movie_user FOREIGN KEY(created_by) REFERENCES "user" (id)
);
