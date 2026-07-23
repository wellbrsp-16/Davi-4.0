# Guia de Deploy - MeuNiver PWA & Web (Vercel & Supabase)

Este documento detalha o passo a passo completo para publicar este projeto na **Vercel** e conectar com um banco de dados real no **Supabase**.

---

## 🛠️ Passo 1: Inicializar o Repositório Git

1. No terminal do seu projeto, initialize e commite os arquivos locais:
   ```bash
   cd /Users/wellbrsp/dev/MeuNiver
   git init
   git add .
   git commit -m "feat: estrutura inicial do MeuNiver com suporte PWA, Web e Supabase"
   ```
2. Crie um repositório no seu GitHub (pode ser privado) chamado `MeuNiver`.
3. Vincule e envie o código:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/MeuNiver.git
   git branch -M main
   git push -u origin main
   ```

---

## 💾 Passo 2: Criar e Configurar o Banco no Supabase

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e crie um novo projeto (ex: `MeuNiver`).
2. Defina uma **Database Password** forte e guarde-a.
3. Com o projeto criado, acesse a aba **SQL Editor** no painel esquerdo.
4. Clique em **New Query** e cole todo o conteúdo do arquivo de migração:
   - 📄 [supabase/migrations/20260723000000_init.sql](file:///Users/wellbrsp/dev/MeuNiver/supabase/migrations/20260723000000_init.sql)
   - *Este script criará as tabelas `config_evento`, `usuarios`, `convidados`, `financeiro`, habilitará RLS e criará as políticas de acesso.*
5. Clique em **Run** no canto inferior direito para executar a migração.
6. Crie outra query (**New Query**) e cole todo o conteúdo do arquivo de seed:
   - 📄 [supabase/seed.sql](file:///Users/wellbrsp/dev/MeuNiver/supabase/seed.sql)
   - *Este script criará o usuário admin (com senha criptografada), Wellington, Raissa, além de dados iniciais de exemplo.*
7. Clique em **Run** para rodar o seed.

---

## 🚀 Passo 3: Criar o Projeto na Vercel

1. Crie uma conta gratuita em [vercel.com](https://vercel.com).
2. Clique em **Add New...** -> **Project**.
3. Importe o repositório `MeuNiver` do seu GitHub.
4. Na seção **Environment Variables** (Variáveis de Ambiente), adicione as chaves que você encontra nas configurações do seu Supabase (*Project Settings -> API*):
   - `NEXT_PUBLIC_SUPABASE_URL` = *Seu Project URL (Ex: `https://xxxxxx.supabase.co`)*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = *Sua API Key Anon (Ex: `eyJhbGciOi...`)*
5. Clique em **Deploy**.

---

## 🔄 Passo 4: Como Funciona o Chaveamento Automático

Nós criamos uma arquitetura híbrida de banco de dados no arquivo [supabase.ts](file:///Users/wellbrsp/dev/MeuNiver/src/utils/supabase.ts):
- **Local / Sem Supabase**: Se as variáveis acima não forem preenchidas, o aplicativo entra automaticamente no modo **Simulado (localStorage)**, permitindo testes sem internet ou banco real.
- **Produção / Com Supabase**: Assim que você configurar as variáveis de ambiente na Vercel (ou no arquivo `.env.local` localmente), a aplicação chaveia instantaneamente para comunicar-se via REST API com o Supabase na nuvem, atualizando os dados em tempo real!
