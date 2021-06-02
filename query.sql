CREATE TABLE users (
    username varchar(50) UNIQUE,
    _id UUID PRIMARY KEY
);

CREATE TABLE exercices (
    user_id UUID REFERENCES users (_id),
    description varchar(500),
    duration INTEGER,
    date DATE
);