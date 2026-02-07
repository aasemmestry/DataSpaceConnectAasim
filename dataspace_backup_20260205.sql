--
-- PostgreSQL database dump
--

\restrict QYbXABE5CCnvedRO5UL7Ytlu2zhFsxYa9zJQyR5k92UgnqqNYcF3B68YtC4xxPI

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DatacenterStatus; Type: TYPE; Schema: public; Owner: aasimmistry
--

CREATE TYPE public."DatacenterStatus" AS ENUM (
    'ACTIVE',
    'PENDING',
    'INACTIVE'
);


ALTER TYPE public."DatacenterStatus" OWNER TO aasimmistry;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: aasimmistry
--

CREATE TYPE public."UserRole" AS ENUM (
    'OFFERER',
    'SEEKER',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO aasimmistry;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuthToken; Type: TABLE; Schema: public; Owner: aasimmistry
--

CREATE TABLE public."AuthToken" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuthToken" OWNER TO aasimmistry;

--
-- Name: Datacenter; Type: TABLE; Schema: public; Owner: aasimmistry
--

CREATE TABLE public."Datacenter" (
    id text NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "powerCapacityKW" double precision NOT NULL,
    "serverModels" text[],
    "coolingSystem" text,
    "securityFeatures" text[],
    "establishmentYear" integer,
    status public."DatacenterStatus" DEFAULT 'PENDING'::public."DatacenterStatus" NOT NULL,
    "rejectionReason" text,
    "ownerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Datacenter" OWNER TO aasimmistry;

--
-- Name: Node; Type: TABLE; Schema: public; Owner: aasimmistry
--

CREATE TABLE public."Node" (
    id integer NOT NULL,
    node_hash character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    zone character varying(100) NOT NULL,
    capacity integer NOT NULL,
    utilization character varying(10) DEFAULT '0%'::character varying,
    status character varying(20) DEFAULT 'Provisioning'::character varying,
    latitude numeric(10,8),
    longitude numeric(11,8),
    offerer_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tier character varying(50),
    os character varying(50),
    bandwidth character varying(50),
    rental_rate numeric(10,2) DEFAULT 45.00
);


ALTER TABLE public."Node" OWNER TO aasimmistry;

--
-- Name: User; Type: TABLE; Schema: public; Owner: aasimmistry
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "fullName" text,
    "companyName" text,
    role public."UserRole" DEFAULT 'SEEKER'::public."UserRole" NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO aasimmistry;

--
-- Name: nodes_id_seq; Type: SEQUENCE; Schema: public; Owner: aasimmistry
--

CREATE SEQUENCE public.nodes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.nodes_id_seq OWNER TO aasimmistry;

--
-- Name: nodes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aasimmistry
--

ALTER SEQUENCE public.nodes_id_seq OWNED BY public."Node".id;


--
-- Name: Node id; Type: DEFAULT; Schema: public; Owner: aasimmistry
--

ALTER TABLE ONLY public."Node" ALTER COLUMN id SET DEFAULT nextval('public.nodes_id_seq'::regclass);


--
-- Data for Name: AuthToken; Type: TABLE DATA; Schema: public; Owner: aasimmistry
--

COPY public."AuthToken" (id, token, "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Datacenter; Type: TABLE DATA; Schema: public; Owner: aasimmistry
--

COPY public."Datacenter" (id, name, location, latitude, longitude, "powerCapacityKW", "serverModels", "coolingSystem", "securityFeatures", "establishmentYear", status, "rejectionReason", "ownerId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Node; Type: TABLE DATA; Schema: public; Owner: aasimmistry
--

COPY public."Node" (id, node_hash, name, zone, capacity, utilization, status, latitude, longitude, offerer_id, created_at, tier, os, bandwidth, rental_rate) FROM stdin;
10	NODE-IND-01	MUMBAI-DX-01	Mumbai, IN	1024	42%	Active	19.07600000	72.87700000	\N	2026-02-05 17:25:07.844626	Compute Optimized	Ubuntu 22.04	10 Gbps	55.00
11	NODE-UK-01	LONDON-EDGE-02	London, UK	2048	12%	Active	51.50700000	-0.12700000	\N	2026-02-05 17:25:07.844626	General Purpose	Debian 12	1 Gbps	40.00
12	NODE-US-01	NYC-CORE-01	New York, US	512	8%	Active	40.71200000	-74.00600000	\N	2026-02-05 17:25:07.844626	Memory Optimized	RHEL 9	100 Gbps	120.00
13	NODE-JPN-01	TOKYO-DX-04	Tokyo, JP	1024	65%	Active	35.67600000	139.65000000	\N	2026-02-05 17:25:07.844626	Compute Optimized	Ubuntu 22.04	10 Gbps	65.00
14	NODE-AUS-01	SYDNEY-SOUTH-01	Sydney, AU	2048	15%	Active	-33.86800000	151.20900000	\N	2026-02-05 17:25:07.844626	General Purpose	Ubuntu 20.04	1 Gbps	35.00
15	NODE-BRA-01	SAO-PAULO-01	Sao Paulo, BR	1024	30%	Active	-23.55000000	-46.63300000	\N	2026-02-05 17:25:07.844626	Memory Optimized	Debian 11	10 Gbps	50.00
16	MUM-DX-01	MUMBAI-CORE-01	Mumbai, IN	1024	42%	Active	19.07600000	72.87700000	\N	2026-02-05 18:07:58.622396	Compute Optimized	Ubuntu 22.04	10 Gbps	55.00
17	SUR-DX-01	SURAT-EDGE-01	Surat, IN	512	10%	Active	21.17000000	72.83100000	\N	2026-02-05 18:07:58.622396	General Purpose	Ubuntu 22.04	1 Gbps	35.00
18	LON-DX-01	LONDON-EDGE-02	London, UK	2048	12%	Active	51.50700000	-0.12700000	\N	2026-02-05 18:07:58.622396	General Purpose	Debian 12	1 Gbps	40.00
19	NYC-DX-01	NYC-CORE-01	New York, US	512	8%	Active	40.71200000	-74.00600000	\N	2026-02-05 18:07:58.622396	Memory Optimized	RHEL 9	100 Gbps	120.00
20	TOK-DX-01	TOKYO-DX-04	Tokyo, JP	1024	65%	Active	35.67600000	139.65000000	\N	2026-02-05 18:07:58.622396	Compute Optimized	Ubuntu 22.04	10 Gbps	65.00
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: aasimmistry
--

COPY public."User" (id, email, password, "fullName", "companyName", role, "isVerified", "createdAt", "updatedAt") FROM stdin;
3a928dd5-cc59-4084-92d5-3e75eb1815fc	aasim@datagreen.cloud	$2b$10$jA6ifxwGwF3KG/N7nL3Y.u5NfHw1O/ofiJwEDg5l/IZuyAw4BXsim	Aasim	DataGreen	OFFERER	f	2026-02-05 07:08:54.744	2026-02-05 07:08:54.744
8a368e28-a0e5-471f-a8e5-5dfad83e6912	ndplseo@gmail.com	$2b$10$f3DHEA07qgRt5y265Fh4OOZJRobwTT6NlgGhbdDw5whjzFcfm9weK	NDPLSEO	NDPL	SEEKER	f	2026-02-05 12:23:25.404	2026-02-05 12:23:25.404
\.


--
-- Name: nodes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aasimmistry
--

SELECT pg_catalog.setval('public.nodes_id_seq', 20, true);


--
-- Name: AuthToken AuthToken_pkey; Type: CONSTRAINT; Schema: public; Owner: aasimmistry
--

ALTER TABLE ONLY public."AuthToken"
    ADD CONSTRAINT "AuthToken_pkey" PRIMARY KEY (id);


--
-- Name: Datacenter Datacenter_pkey; Type: CONSTRAINT; Schema: public; Owner: aasimmistry
--

ALTER TABLE ONLY public."Datacenter"
    ADD CONSTRAINT "Datacenter_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: aasimmistry
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Node nodes_node_hash_key; Type: CONSTRAINT; Schema: public; Owner: aasimmistry
--

ALTER TABLE ONLY public."Node"
    ADD CONSTRAINT nodes_node_hash_key UNIQUE (node_hash);


--
-- Name: Node nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: aasimmistry
--

ALTER TABLE ONLY public."Node"
    ADD CONSTRAINT nodes_pkey PRIMARY KEY (id);


--
-- Name: AuthToken_token_key; Type: INDEX; Schema: public; Owner: aasimmistry
--

CREATE UNIQUE INDEX "AuthToken_token_key" ON public."AuthToken" USING btree (token);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: aasimmistry
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: AuthToken AuthToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aasimmistry
--

ALTER TABLE ONLY public."AuthToken"
    ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Datacenter Datacenter_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aasimmistry
--

ALTER TABLE ONLY public."Datacenter"
    ADD CONSTRAINT "Datacenter_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict QYbXABE5CCnvedRO5UL7Ytlu2zhFsxYa9zJQyR5k92UgnqqNYcF3B68YtC4xxPI

