# BarberPro — Sistema Web de Gestão de Barbearia

O **BarberPro** é uma aplicação web full-stack para gestão de serviços e agendamentos de uma barbearia.  
O sistema permite que clientes realizem cadastro, login e solicitação de agendamentos, enquanto administradores/barbeiros gerenciam serviços, acompanham a agenda e atualizam o status dos atendimentos.

Esta versão do projeto foi migrada para uma arquitetura com **Spring Boot no backend**, **React no frontend**, **PostgreSQL como banco de dados** e **RabbitMQ para mensageria**, atendendo ao objetivo do Projeto Integrador de desenvolver uma solução web distribuída com processamento assíncrono.

> Projeto Integrador de Módulo — 2026

---

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura Atual](#arquitetura-atual)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Fluxo de Mensageria](#fluxo-de-mensageria)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Como Rodar o Projeto](#como-rodar-o-projeto)
- [Usuários de Teste](#usuários-de-teste)
- [Principais Endpoints](#principais-endpoints)
- [Banco de Dados](#banco-de-dados)
- [RabbitMQ](#rabbitmq)
- [Observações Importantes](#observações-importantes)
- [Pendências e Próximos Passos](#pendências-e-próximos-passos)
- [Autores](#autores)

---

## Visão Geral

O BarberPro resolve problemas comuns de barbearias que fazem controle manual de horários, serviços e atendimentos.

Problemas tratados pelo sistema:

- Cadastro e autenticação de usuários;
- Controle de perfis: cliente, barbeiro e administrador;
- Cadastro e gerenciamento de serviços;
- Solicitação de agendamentos;
- Controle de status dos agendamentos;
- Validação de conflito de horário;
- Processamento assíncrono de agendamentos com RabbitMQ;
- Interface web em React;
- Backend estruturado em camadas com Spring Boot.

---

## Tecnologias Utilizadas

### Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- Bean Validation
- RabbitMQ / Spring AMQP
- WebSocket / STOMP
- PostgreSQL Driver
- Lombok
- Maven

### Frontend

- React
- Vite
- JavaScript
- Axios
- React Router DOM
- CSS

### Banco de Dados

- PostgreSQL

### Mensageria

- RabbitMQ
- Docker para execução local do RabbitMQ

---

## Arquitetura Atual

A aplicação está organizada em duas partes principais:

```text
BarberPro/
├── Backend/
│   └── barberproapi/
│       ├── src/
│       ├── pom.xml
│       └── mvnw.cmd
│
├── Frontend/
│   └── barberpro-web/
│       ├── src/
│       ├── package.json
│       └── vite.config.js
│
└── README.md
```

Fluxo geral da aplicação:

```text
React
  ↓
Spring Boot API REST
  ↓
PostgreSQL

Spring Boot
  ↓
RabbitMQ
  ↓
AppointmentConsumer
  ↓
Atualização do status do agendamento
```

---

## Funcionalidades Implementadas

### Autenticação

- Cadastro de usuário;
- Login;
- Geração de token JWT;
- Proteção de rotas;
- Controle de acesso por perfil.

### Usuários

Perfis previstos:

- `ADMIN`
- `BARBEIRO`
- `CLIENTE`

### Serviços

- Listagem de serviços;
- Cadastro de serviços;
- Edição de serviços;
- Inativação/exclusão de serviços.

### Agendamentos

- Cliente cria agendamento;
- Sistema valida conflito de horário;
- Agendamento é salvo no banco;
- Evento é publicado no RabbitMQ;
- Consumer processa a mensagem;
- Status do agendamento é atualizado;
- React exibe o status atualizado.

---

## Fluxo de Mensageria

A mensageria é usada no fluxo de criação de agendamentos.

Fluxo atual:

```text
1. Cliente cria um agendamento no React
2. React envia POST para /api/appointments
3. Spring Boot salva o agendamento no PostgreSQL
4. Spring Boot publica evento no RabbitMQ
5. RabbitMQ recebe o evento na fila barberpro.appointments.queue
6. AppointmentConsumer consome a mensagem
7. O backend atualiza o status do agendamento
8. O frontend exibe o novo status
```

Fila principal:

```text
barberpro.appointments.queue
```

Exchange:

```text
barberpro.exchange
```

Routing key:

```text
appointment.created
```

Observação de regra de negócio:

Atualmente, o consumer pode atualizar o agendamento automaticamente após o processamento.  
Caso a equipe queira manter a confirmação manual pelo barbeiro, o fluxo ideal é:

```text
PENDENTE
↓
PROCESSANDO
↓
AGUARDANDO_CONFIRMACAO
↓
CONFIRMADO pelo barbeiro/admin
```

Essa alteração deixa a mensageria responsável pelo processamento da solicitação, sem substituir a decisão manual do barbeiro.

---

## Estrutura do Backend

Pacote principal:

```text
com.barberpro.barberproapi
```

Estrutura:

```text
src/main/java/com/barberpro/barberproapi/
├── config/
├── controller/
├── consumer/
├── domain/
├── dto/
├── exception/
├── repository/
└── service/
```

Responsabilidades principais:

| Pacote | Responsabilidade |
|---|---|
| `config` | Configurações de segurança, CORS, RabbitMQ e WebSocket |
| `controller` | Endpoints REST |
| `consumer` | Consumo de mensagens RabbitMQ |
| `domain` | Entidades JPA e enums |
| `dto` | Objetos de entrada e saída da API |
| `exception` | Tratamento de erros |
| `repository` | Acesso ao banco de dados |
| `service` | Regras de negócio |

---

## Estrutura do Frontend

Estrutura principal:

```text
Frontend/barberpro-web/src/
├── components/
├── contexts/
├── pages/
├── routes/
├── services/
├── styles/
├── App.jsx
└── main.jsx
```

Responsabilidades:

| Pasta | Responsabilidade |
|---|---|
| `pages` | Telas do sistema |
| `components` | Componentes reutilizáveis |
| `services` | Comunicação com a API |
| `contexts` | Contexto de autenticação |
| `routes` | Rotas da aplicação |
| `styles` | Estilos CSS |

Arquivo principal de conexão com API:

```text
src/services/api.js
```

Base da API:

```text
http://localhost:8080/api
```

---

# Como Rodar o Projeto

## Pré-requisitos

Instale antes:

- Java 21
- Node.js
- PostgreSQL
- Docker Desktop
- Git
- VS Code ou IDE de preferência

---

## 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd BarberPro
```

---

## 2. Criar o banco PostgreSQL

No pgAdmin ou terminal SQL, crie o banco:

```sql
CREATE DATABASE barberpro_spring;
```

Não é necessário criar as tabelas manualmente.  
O Spring Boot cria as tabelas automaticamente por causa da configuração:

```properties
spring.jpa.hibernate.ddl-auto=update
```

---

## 3. Configurar o backend

Abra o arquivo:

```text
Backend/barberproapi/src/main/resources/application.properties
```

Exemplo de configuração local:

```properties
spring.application.name=barberproapi
server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/barberpro_spring
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA_DO_POSTGRES
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest

app.jwt.secret=barberpro-super-secret-key-2026-projeto-integrador
app.jwt.expiration-ms=86400000

app.cors.allowed-origins=http://localhost:5173,http://localhost:3000,http://localhost:8080
```

Atenção: não envie sua senha real do PostgreSQL para o GitHub.  
Antes de subir o projeto, deixe como:

```properties
spring.datasource.password=SUA_SENHA_DO_POSTGRES
```

---

## 4. Subir o RabbitMQ com Docker

Abra o Docker Desktop.

Depois, no PowerShell, rode:

```powershell
docker run -d --name rabbitmq-barberpro -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Caso o container já exista, use:

```powershell
docker start rabbitmq-barberpro
```

Para verificar se está rodando:

```powershell
docker ps
```

Painel web do RabbitMQ:

```text
http://localhost:15672
```

Login padrão:

```text
Usuário: guest
Senha: guest
```

---

## 5. Rodar o backend Spring Boot

No PowerShell:

```powershell
cd "Backend/barberproapi"
.\mvnw.cmd spring-boot:run
```

Quando aparecer algo parecido com:

```text
Tomcat started on port 8080
Started BarberproapiApplication
```

o backend estará rodando.

Endereço do backend:

```text
http://localhost:8080
```

Observação: acessar `http://localhost:8080` diretamente pode retornar `403`.  
Isso é normal, pois o Spring Security protege as rotas da aplicação.

---

## 6. Instalar dependências do frontend

Em outro terminal:

```powershell
cd "Frontend/barberpro-web"
npm install
```

Se necessário, instale as dependências principais:

```powershell
npm install axios react-router-dom
```

---

## 7. Rodar o frontend React

```powershell
npm run dev
```

Acesse:

```text
http://localhost:5173
```

---

## 8. Rodar tudo ao mesmo tempo

Para testar o sistema, mantenha três serviços ativos:

```text
1. PostgreSQL
2. RabbitMQ via Docker
3. Backend Spring Boot
4. Frontend React
```

Na prática, você terá:

Terminal 1 — Backend:

```powershell
cd "Backend/barberproapi"
.\mvnw.cmd spring-boot:run
```

Terminal 2 — Frontend:

```powershell
cd "Frontend/barberpro-web"
npm run dev
```

RabbitMQ — Docker:

```powershell
docker start rabbitmq-barberpro
```

---

## Usuários de Teste

Se o seeder estiver ativo no backend, os seguintes usuários são criados automaticamente:

### Administrador

```text
E-mail: admin@barberpro.com
Senha: 123456
```

### Cliente

```text
E-mail: joao@barberpro.com
Senha: 123456
```

### Barbeiro

```text
E-mail: carlos@barberpro.com
Senha: 123456
```

---

## Principais Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cadastro de usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Dados do usuário autenticado |

### Serviços

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/services` | Lista serviços |
| GET | `/api/services/{id}` | Busca serviço por ID |
| POST | `/api/services` | Cadastra serviço |
| PUT | `/api/services/{id}` | Atualiza serviço |
| DELETE | `/api/services/{id}` | Remove/inativa serviço |

### Agendamentos

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/appointments` | Lista agendamentos |
| GET | `/api/appointments/{id}` | Busca agendamento por ID |
| POST | `/api/appointments` | Cria agendamento |
| PATCH | `/api/appointments/{id}/status` | Atualiza status |
| DELETE | `/api/appointments/{id}` | Cancela/remove agendamento |

### Barbeiros

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/barbeiros` | Lista usuários barbeiros/admins disponíveis |

### Teste de Mensageria

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/hello` | Envia mensagem de teste para fila RabbitMQ |

---

## Banco de Dados

Principais tabelas:

```text
users
barber_services
appointments
```

Possíveis status de agendamento:

```text
PENDENTE
PROCESSANDO
AGUARDANDO_CONFIRMACAO
CONFIRMADO
CANCELADO
CONCLUIDO
ERRO
```

A tabela de agendamentos armazena:

- Cliente;
- Barbeiro;
- Serviço;
- Data e hora;
- Status;
- Observações;
- Datas de criação e atualização.

---

## RabbitMQ

O RabbitMQ pode ser acompanhado pelo painel:

```text
http://localhost:15672
```

Na aba **Queues and Streams**, devem aparecer filas como:

```text
barberpro.appointments.queue
barberpro.hello.queue
```

Quando um agendamento é criado, a fila de appointments recebe atividade.

Se a fila aparecer com:

```text
Ready: 0
Unacked: 0
Total: 0
```

isso pode significar que a mensagem já foi consumida rapidamente pelo consumer.

---

## Validação do Fluxo Principal

Para validar o funcionamento completo:

1. Rodar PostgreSQL;
2. Rodar RabbitMQ;
3. Rodar backend Spring Boot;
4. Rodar frontend React;
5. Fazer login como cliente;
6. Criar um novo agendamento;
7. Verificar atividade no painel RabbitMQ;
8. Conferir o status no banco;
9. Conferir o status no React;
10. Fazer login como admin/barbeiro e acompanhar o agendamento.

Fluxo esperado:

```text
Cliente cria agendamento
↓
Backend salva no banco
↓
Backend publica evento no RabbitMQ
↓
Consumer processa a mensagem
↓
Status é atualizado
↓
Frontend exibe o resultado
```

---

## Observações Importantes

- O backend roda na porta `8080`.
- O frontend roda na porta `5173`.
- O RabbitMQ usa a porta `5672`.
- O painel do RabbitMQ usa a porta `15672`.
- O PostgreSQL normalmente usa a porta `5432`.
- Erro `403` em `http://localhost:8080` é normal por causa do Spring Security.
- Erro `409 Conflict` ao criar agendamento indica conflito de horário para o barbeiro selecionado.
- Erro `ERR_CONNECTION_REFUSED` no React geralmente significa que o backend não está rodando.

---

## Autores

- Gabriel da Silva Coelho
- Frederico da Silva Kunert
- Arthur Boaventura Riesco

---

## Status Atual

Versão atual do projeto:

```text
Backend: Spring Boot
Frontend: React
Banco: PostgreSQL
Mensageria: RabbitMQ
Autenticação: JWT
Status: fluxo principal funcional em ambiente local
```
