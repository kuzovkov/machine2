CREATE TABLE IF NOT EXISTS courses
(
  id serial PRIMARY KEY,
  symbol VARCHAR (255) NOT NULL,
  price REAL NOT NULL,
  time_stamp BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);





