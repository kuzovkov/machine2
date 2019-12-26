CREATE TABLE public.symbol (
  name CHARACTER VARYING(100),
  scode CHARACTER UNIQUE VARYING(50),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  price NUMERIC(9,6)
);

create unique index index_symbol_id on public.symbol(scode);





