CREATE TABLE "user"
(
	"id" SERIAL NOT NULL, 
	"name" character varying NOT NULL, 
	"email" character varying NOT NULL UNIQUE, 
	"password" character varying NOT NULL,
	"created_at" TIMESTAMP NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP NOT NULL DEFAULT now(),
	PRIMARY KEY ("id")
);