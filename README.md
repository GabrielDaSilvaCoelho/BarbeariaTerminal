# BarberPro — Projeto Web Full-Stack

O sistema BarberPro resolve o problema de gestão de serviços e agendamentos de uma barbearia, permitindo o uso por dois perfis distintos: administrador/barbeiro e cliente.

# Objetivo do Projeto

O BarberPro foi criado para digitalizar o processo de atendimento de uma barbearia, permitindo:

* cadastro e autenticação de usuários
* separação por perfis de acesso
* cadastro de serviços
* criação e gerenciamento de agendamentos
* visualização de agenda
* experiência responsiva para desktop e mobile

# Arquitetura do Projeto

O projeto foi estruturado em arquitetura em camadas

# Tecnologias Utilizadas

## Back-end

* Node.js
* Express.js
* PostgreSQL
* JWT
* bcrypt
* dotenv

## Front-end

* HTML5 semântico
* CSS3 responsivo
* JavaScript Vanilla
* Fetch API
* LocalStorage

## UI/UX

* Layout baseado em cards + sidebar + feedback visual
* Responsividade para desktop, tablet e mobile (375px+)
* Estados de erro, sucesso, loading e empty state
* Foco acessível para navegação por teclado

# Perfis de Usuário

## Administrador / Barbeiro

Pode:

* cadastrar serviços
* editar serviços
* excluir serviços
* visualizar todos os agendamentos
* gerenciar agenda

## Cliente

Pode:

* criar conta
* fazer login
* visualizar serviços
* criar agendamentos
* cancelar agendamentos
* visualizar histórico

# Autenticação

**JWT (JSON Web Token)**.

Fluxo:

1. usuário realiza login
2. API gera token JWT
3. token é salvo no `localStorage`
4. rotas protegidas usam `Authorization: Bearer <token>`
5. middleware valida autenticação e perfil

# Banco de Dados

Banco utilizado: **PostgreSQL**

## Entidades principais

* `users`
* `services`
* `appointments`

Relacionamentos:

* um usuário pode ter vários agendamentos
* um serviço pode ser usado em vários agendamentos

# Seed do Projeto

O projeto possui script de seed para demonstração.

## Usuários criados

* **[admin@barberpro.com](mailto:admin@barberpro.com)** → senha `123456`
* **[frede@test.com](mailto:frede@test.com)** → senha `123456`

Também são criados:

* serviços de exemplo
* agendamentos de demonstração

# Como Executar o Projeto

## Clonar repositório

```bash
git clone <url-do-repositorio>
cd barberpro
```

## Backend

```bash
cd backend
npm install
```

## Configurar `.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=barberpro
DB_USER=postgres
DB_PASSWORD=123456
JWT_SECRET=barberpro-secret
JWT_EXPIRES_IN=7d
PORT=3000
```

## Criar banco

```sql
CREATE DATABASE barberpro;
```

## Rodar seed

```bash
npm run seed
```

## Iniciar servidor

```bash
npm start
```

## Abrir frontend

Abra no navegador:

```text
frontend/login.html
```

# Boas Práticas de UI/UX Aplicadas

## Hierarquia visual

* títulos em destaque
* sidebar para navegação
* cards para separação visual

## Feedback ao usuário

* sucesso
* erro
* loading
* confirmação de exclusão
* empty state

## Acessibilidade

* focus visível
* contraste adequado
* labels em todos os campos
* campos com toque mínimo 44x44

## Responsividade

* desktop
* tablet
* mobile
* suporte 375px

# Design Patterns Aplicados

## Middleware Pattern

Usado para:

* autenticação
* autorização
* tratamento de erros

## Service Layer Pattern

Separação entre:

* controller
* service
* model

Benefício:

* manutenção facilitada
* melhor organização
* reaproveitamento de lógica

# Princípios SOLID

## SRP — Single Responsibility

Cada camada possui responsabilidade única.

## DIP — Dependency Inversion

Controllers dependem de services, reduzindo acoplamento.

# Funcionalidades Entregues

* login
* cadastro
* autenticação JWT
* dois perfis
* CRUD de serviços
* CRUD de agendamentos
* listagem
* filtros por perfil
* responsividade
* feedback visual
* seed
* README


# Conclusão

O projeto foi desenvolvido com o propósito de atender, de forma integrada, aos requisitos das disciplinas de Desenvolvimento Web, Modelagem de Interfaces UI/UX e Design de Software.

A solução proposta apresenta uma aplicação web full-stack funcional, com separação clara entre front-end e back-end, autenticação baseada em JWT, persistência em banco de dados relacional, interface responsiva e aplicação consciente de boas práticas de arquitetura e experiência do usuário.

Além do atendimento aos requisitos funcionais mínimos, o sistema demonstra preocupação com manutenibilidade, escalabilidade, organização em camadas, padrões de projeto e princípios SOLID, evidenciando uma abordagem alinhada ao contexto acadêmico e às práticas utilizadas no mercado.

Dessa forma, o BarberPro representa uma entrega consistente, coerente com o escopo proposto pela atividade e adequada para apresentação final.

# Integrantes

**Frederico da Silva Kunert**
**Gabriel da Silva Coelho**
PUC Goiás — Análise e Desenvolvimento de Sistemas
