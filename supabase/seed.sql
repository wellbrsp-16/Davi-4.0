-- Seed Event Config
insert into config_evento (nome_aniversariante, data_festa)
values ('Benício', now() + interval '3 months')
on conflict do nothing;

-- Seed Admin User (password is 'admin' hashed with blowfish/bcrypt via crypt)
insert into usuarios (nome, login, senha_hash, forcar_troca_senha)
values (
    'Administrador',
    'admin',
    crypt('admin', gen_salt('bf', 10)),
    true
)
on conflict (login) do nothing;

-- Seed Wellington as user
insert into usuarios (nome, login, senha_hash, forcar_troca_senha)
values (
    'Wellington',
    'wellington',
    crypt('niver2026', gen_salt('bf', 10)),
    false
)
on conflict (login) do nothing;

-- Seed Raissa with temporary password (forced change on first login)
insert into usuarios (nome, login, senha_hash, forcar_troca_senha)
values (
    'Raissa',
    'raissa',
    crypt('123456@', gen_salt('bf', 10)),
    true
)
on conflict (login) do nothing;

-- Seed Convidados
insert into convidados (nome, tipo, convidado_por, participacoes, prioridade, confirmado)
values
('Tio Tailz', 'Adulto', 'Wellington', array['Festa', 'Almoço'], 1, true),
('Arthur (Amiguinho)', 'Criança', 'Raissa', array['Festa'], 1, true),
('Sofia (Prima)', 'Criança', 'Raissa', array['Festa'], 2, false),
('Marcos Silva', 'Adulto', 'Wellington', array['Festa'], 3, false),
('Maria Souza', 'Adulto', 'Raissa', array['Festa'], 2, true),
('Lucas Rodrigues', 'Criança', 'Wellington', array['Festa'], 1, false)
on conflict do nothing;

-- Seed Financeiro
insert into financeiro (data, item, valor_total, valor_pago, pagante, observacao)
values
('2026-07-15', 'Reserva do Espaço Green Hill', 1500.00, 500.00, 'Wellington', 'Sinal pago, restante na semana do evento'),
('2026-07-20', 'Decoração Temática Sonic & Amigos', 2200.00, 2200.00, 'Raissa', 'Decoração premium inclusa mesa de bolo 3D'),
('2026-07-22', 'Bolo Cenográfico e Doces Personalizados', 650.00, 300.00, 'Raissa', 'Doces com formato de argolas e esmeraldas do caos'),
('2026-07-23', 'Salgados Finos (1000 unidades)', 800.00, 0.00, 'Wellington', 'Pagamento na entrega')
on conflict do nothing;
