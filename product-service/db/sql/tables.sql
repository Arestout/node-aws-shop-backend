--drop table stocks;
--drop table products;

create table products (
	id uuid primary key default uuid_generate_v4(),
	title text not null,
	description text,
	price integer,
	image text
);


create table stocks (
	id uuid primary key default uuid_generate_v4(),
	product_id uuid,
	count integer,
	foreign key ("product_id") references "products" ("id")
);


create extension if not exists "uuid-ossp";