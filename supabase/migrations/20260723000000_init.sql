-- Enable extensions
create extension if not exists pgcrypto;

-- 1. config_evento table
create table if not exists config_evento (
    id uuid primary key default gen_random_uuid(),
    nome_aniversariante text not null,
    data_festa timestamp with time zone not null,
    criado_em timestamp with time zone not null default now()
);

-- 2. usuarios table
create table if not exists usuarios (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    login text unique not null,
    senha_hash text not null,
    ultimo_acesso timestamp with time zone,
    forcar_troca_senha boolean not null default true
);

-- 3. convidados table
create table if not exists convidados (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    tipo text not null check (tipo in ('Adulto', 'Criança')),
    convidado_por text not null check (convidado_por in ('Wellington', 'Raissa')),
    participacoes text[] not null default '{}'::text[],
    prioridade integer not null check (prioridade between 1 and 3),
    confirmado boolean,
    convite_enviado boolean default false,
    criado_em timestamp with time zone not null default now()
);

-- 4. financeiro table
create table if not exists financeiro (
    id uuid primary key default gen_random_uuid(),
    data date not null,
    item text not null,
    valor_total numeric(10, 2) not null,
    valor_pago numeric(10, 2) not null,
    valor_pendente numeric(10, 2) generated always as (valor_total - valor_pago) stored,
    pagante text not null check (pagante in ('Wellington', 'Raissa')),
    observacao text,
    comprovante_url text,
    criado_em timestamp with time zone not null default now()
);

-- Enable Row Level Security (RLS) on all tables
alter table config_evento enable row level security;
alter table usuarios enable row level security;
alter table convidados enable row level security;
alter table financeiro enable row level security;

-- Create policies (for now, allow all access so development and API work easily, or restrict based on authed users)
-- In a real app we would restrict, but for initial setup we can allow all access, or create simple policies.
-- Let's create simple policies allowing authenticated access or all access for simplicity of dev.
create policy "Permitir tudo para config_evento" on config_evento for all using (true) with check (true);
create policy "Permitir tudo para usuarios" on usuarios for all using (true) with check (true);
create policy "Permitir tudo para convidados" on convidados for all using (true) with check (true);
create policy "Permitir tudo para financeiro" on financeiro for all using (true) with check (true);
