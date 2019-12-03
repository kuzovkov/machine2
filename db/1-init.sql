--SET statement_timeout = 0;
--SET lock_timeout = 0;
--SET idle_in_transaction_session_timeout = 0;
--SET client_encoding = 'UTF8';
--SET standard_conforming_strings = on;
--SET check_function_bodies = false;
--SET client_min_messages = warning;
--SET row_security = off;

--
-- Name: postgres; Type: COMMENT; Schema: -; Owner: postgres
--

--COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

--COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

ALTER ROLE postgres WITH PASSWORD 'xtramileDev';
CREATE ROLE xtramile LOGIN INHERIT PASSWORD 'xtramileDev' SUPERUSER;
GRANT postgres TO xtramile;

DROP DATABASE IF EXISTS  xtramile;
CREATE DATABASE  xtramile WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8' OWNER xtramile;

DROP DATABASE IF EXISTS  xtramile_dev;
CREATE DATABASE xtramile_dev WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8' OWNER xtramile;

CREATE ROLE xtramile_read LOGIN INHERIT;
GRANT postgres TO xtramile_read;

CREATE ROLE readonlyuser LOGIN INHERIT;
GRANT postgres TO readonlyuser;


