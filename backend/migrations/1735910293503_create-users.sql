-- Up Migration
CREATE TABLE IF NOT EXISTS a_users (
	id SERIAL PRIMARY KEY,
	name VARCHAR NOT NULL,
	email VARCHAR NOT NULL,
	created_at TIMESTAMP DEFAULT current_timestamp
);

-- Down Migration
DROP TABLE a_users;