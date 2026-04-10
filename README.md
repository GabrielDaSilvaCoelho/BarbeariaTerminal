# BarberPro — Projeto Web Full-Stack

O **BarberPro** é uma aplicação web full-stack desenvolvida para otimizar a gestão de serviços e agendamentos de uma barbearia.  
O sistema atende dois perfis principais de usuário — **administrador/barbeiro** e **cliente** — oferecendo controle de agenda, cadastro de serviços e gerenciamento de atendimentos de forma digital, organizada e responsiva


#  Objetivo do Projeto

O projeto foi desenvolvido com o objetivo de digitalizar o fluxo de atendimento de uma barbearia, permitindo:

- cadastro e autenticação de usuários
- separação por perfis de acesso
- cadastro, edição e exclusão de serviços
- criação e gerenciamento de agendamentos
- visualização da agenda por perfil
- experiência responsiva em desktop e mobile

# Problema que o Sistema Resolve

Em barbearias que ainda utilizam processos manuais ou comunicação informal para marcação de horários, é comum ocorrer:

- conflitos de agendamento
- dificuldade no controle da agenda
- falta de padronização nos serviços cadastrados
- dificuldade de acesso do cliente ao próprio histórico
- pouca organização administrativa

O BarberPro foi criado para resolver esse cenário por meio de uma aplicação web simples, funcional e acessível.


# Arquitetura do Projeto

O sistema foi estruturado em **arquitetura em camadas**, separando responsabilidades entre front-end, rotas, controladores, serviços, repositórios e middlewares.

## Estrutura em camadas
- **Routes** → definem os endpoints da API
- **Controllers** → recebem as requisições HTTP e delegam as ações
- **Services** → concentram as regras de negócio
- **Repositories** → realizam o acesso ao banco de dados
- **Middlewares** → tratam autenticação, autorização e erros

# Tecnologias Utilizadas

## Back-end
- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt
- dotenv

## Front-end
- HTML5 semântico
- CSS3 responsivo
- JavaScript Vanilla
- Fetch API
- LocalStorage

## UI/UX
- Bootstrap 5 como Design System base
- Layout com sidebar, cards e feedback visual
- Responsividade para desktop, tablet e mobile
- Estados visuais de loading, erro, sucesso e empty state
- Navegação com foco acessível por teclado

# Design System Adotado

O projeto adota o **Bootstrap 5** como base de Design System, conforme permitido pelo enunciado da atividade.

A escolha foi feita por oferecer:

- consistência visual entre telas e componentes
- grid responsivo para diferentes resoluções
- utilitários de espaçamento e alinhamento
- integração simples com HTML, CSS e JavaScript puro
- agilidade de implementação em um projeto de curto prazo

Além do Bootstrap, foram aplicados ajustes visuais próprios para reforçar a identidade da aplicação, mantendo consistência entre cores, tipografia, botões, navegação e formulários.

# Perfis de Usuário

## Administrador / Barbeiro
Pode:
- realizar login no sistema
- visualizar todos os agendamentos
- filtrar agendamentos por status
- cadastrar serviços
- editar serviços
- excluir serviços
- gerenciar a agenda geral da barbearia

## Cliente
Pode:
- criar conta
- realizar login
- visualizar seus agendamentos
- criar novos agendamentos
- cancelar/remover seus próprios agendamentos
- consultar histórico de atendimentos

# Autenticação

A autenticação é realizada por meio de **JWT (JSON Web Token)**.

## Fluxo de autenticação
1. o usuário realiza login com e-mail e senha
2. a API gera um token JWT contendo `id` e `role`
3. o token é armazenado no `localStorage`
4. as requisições protegidas enviam o token no header `Authorization: Bearer <token>`
5. middlewares validam autenticação e autorização por perfil

# Banco de Dados

Banco utilizado: **PostgreSQL**

## Entidades principais
- `users`
- `services`
- `appointments`

## Relacionamentos
- um cliente pode possuir vários agendamentos
- um barbeiro pode atender vários agendamentos
- um serviço pode estar associado a vários agendamentos

# Como Executar o Projeto

## Pré-requisitos
- Node.js instalado
- PostgreSQL instalado
- Git instalado

## Passo a passo
### 1) Clone o repositório
```bash
git clone https://github.com/GabrielDaSilvaCoelho/BarbeariaTerminal.git
cd barberpro
```

### 2) Instale as dependências
```bash
npm install
```

### 3) Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=barberpro
DB_USER=postgres
DB_PASSWORD=1234
JWT_SECRET=jwt-key
JWT_EXPIRES_IN=7d

```

### 4) Crie o banco
Crie um banco PostgreSQL chamado:

```sql
barberpro
```

### 5) Execute o script SQL
Execute o arquivo:

```text
database.sql
```

### 6) Popule dados iniciais
```bash
npm run seed
```

### 7) Inicie o projeto
```bash
npm start
```
# Acesso à Aplicação

## Front-end
Abra os arquivos HTML no navegador ou use Live Server.

Principais telas:
- `frontend/login.html`
- `frontend/cadastro.html`
- `frontend/dashboard-admin.html`
- `frontend/dashboard-cliente.html`
- `frontend/novo-agendamento.html`
- `frontend/novo-servico.html`

## API
```text
http://localhost:3000
```

# Usuários para Demonstração

## Administrador
- E-mail: `admin@barberpro.com`
- Senha: `1234`

## Cliente
- E-mail: `cliente@barberpro.com`
- Senha: `1234`

> Ajuste conforme os dados reais do seu seed.


# Principais Rotas da API

## Autenticação
- `POST /api/auth/register`
- `POST /api/auth/login`

## Serviços
- `GET /api/services`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`

## Agendamentos
- `GET /api/appointments`
- `POST /api/appointments`
- `PUT /api/appointments/:id`
- `DELETE /api/appointments/:id`

# Artefatos Complementares

Na pasta `docs/` estão disponíveis:

- diagrama ER
- diagrama estrutural
- documentação dos Design Patterns
- aplicação dos princípios SOLID
- checklist UI/UX
- evidências e capturas de tela

## Protótipo Figma
Adicionar link do Figma aqui:
```text
https://www.figma.com/design/dF1zbDsM0UU1dAzf8m0vzO/figma-integrador?t=M42LjVbKz4aMdz3u-0
```

# Capturas de Tela
Recomendado adicionar no repositório:

- dashboard admin
- dashboard cliente
- novo agendamento
- gerenciar serviços

# Autores
**GABRIEL DA SILVA COELHO**
**FREDERICO DA SILVA KUNERT**
Projeto acadêmico desenvolvido para a **Atividade Integrada — PUC Goiás**
Curso: **Análise e Desenvolvimento de Sistemas**
