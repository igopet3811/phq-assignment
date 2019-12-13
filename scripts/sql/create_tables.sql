CREATE SCHEMA assignment;

CREATE SEQUENCE assignment.tree_uid_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE assignment.tree_uid_seq
    OWNER TO postgres;

CREATE TABLE assignment.tree
(
    uid integer NOT NULL DEFAULT nextval('assignment.tree_uid_seq'::regclass),
	name text,
	size integer,
    CONSTRAINT pk_tree_uid PRIMARY KEY (uid)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE assignment.tree
    OWNER to postgres;

CREATE INDEX idx_tree_uid
    ON assignment.tree (uid);