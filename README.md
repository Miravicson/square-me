# Square Me Microservices Monorepo

This repository contains a set of microservices for the Square Me platform, orchestrated with Docker Compose and managed within an [Nx](https://nx.dev/) monorepo.

## 🧰 Technologies Used & Service Responsibilities

| Service              | Tech Stack                                | Purpose                                                                |
| -------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| **Auth**             | NestJS, gRPC, PostgreSQL                  | Manages user registration, authentication, and authorization.          |
| **Wallet**           | NestJS, gRPC, PostgreSQL                  | Manages wallets, balances, and funds transfer logic.                   |
| **Transaction**      | NestJS, gRPC, PostgreSQL, RabbitMQ, Redis | Orchestrates order creation, wallet debit, and notification dispatch.  |
| **Integration**      | NestJS, gRPC, Redis                       | Fetches exchange rates and handles third-party API communication.      |
| **Notification**     | NestJS, RabbitMQ                          | Listens to RabbitMQ queues and sends emails through Mailhog.           |
| **Backing Services** | Postgres, Redis, RabbitMQ, Mailhog        | Provides supporting infrastructure for state management and messaging. |

---

## 🔗 Service Dependencies & Communication

| Service          | Communicates With                       | Communication Medium                |
| ---------------- | --------------------------------------- | ----------------------------------- |
| **Auth**         | Wallet, Integration                     | gRPC                                |
| **Wallet**       | Integration                             | gRPC                                |
| **Transaction**  | Wallet, Auth, Integration, Notification | gRPC (services) + RabbitMQ (emails) |
| **Notification** | Transaction                             | RabbitMQ                            |
| **Integration**  | Wallet                                  | gRPC                                |

---

## 🔀 Service Types

### Transaction Service

- **Role**: Acts as the **central orchestrator** of the system.
- **Functionality**:
  - Exposes **HTTP endpoints** for client consumption.
  - Delegates work to other services via gRPC.
  - Sends emails by publishing messages to RabbitMQ.

Swagger UI: [http://localhost:3001/swagger](http://localhost:3001/swagger)

---

### Auth Service

- **Role**: Handles authentication and authorization.
- **Functionality**:
  - Exposes **HTTP endpoints** for clients (sign up, login, etc.).
  - Communicates with Wallet and Integration services using gRPC.

Swagger UI: [http://localhost:3000/swagger](http://localhost:3000/swagger)

---

## 🚀 Getting Started

To spin up the entire stack:

1. **Ensure Docker & Docker Compose are installed**.
2. Clone this repo:

   ```bash
   git clone https://github.com/your-org/square-me.git
   cd square-me
   ```

---

## Architecture Diagram

                                 ┌──────────────┐
                                 │    Client    │
                                 └──────┬───────┘
                                        │
                         HTTP           │
                    ┌──────────────────▶│
                    │                  ▼
              ┌────────────┐    ┌──────────────┐
              │   Auth     │    │ Transaction  │
              │  (HTTP +   │    │   (HTTP +    │
              │   gRPC)    │    │    gRPC)     │
              └────┬───────┘    └──────┬───────┘
                   │                  │
        gRPC       │                  │     gRPC
         ┌─────────▼─────┐       ┌────▼────────────┐
         │    Wallet     │◀──────┤  Integration    │
         └───────────────┘       └──────┬──────────┘
                                        │
                               ┌────────▼─────────┐
                               │   Notification   │
                               │   (RabbitMQ)     │
                               └──────────────────┘

---

## 📬 Mailhog

You can test email delivery locally using **Mailhog**:

- **SMTP**: `localhost:1025`
- **UI**: [http://localhost:8025](http://localhost:8025)

---

## 🗄️ Database Initialization

- **Postgres** will be initialized using SQL files from `./docker/initdb`.
- **Redis** and **RabbitMQ** are pre-configured with credentials and ports as defined in the Docker Compose file.

---

## 🧪 Swagger UIs

- **Auth Service Swagger**: [http://localhost:3000/swagger](http://localhost:3000/swagger)
- **Transaction Service Swagger**: [http://localhost:3001/swagger](http://localhost:3001/swagger)

---

## 📦 Environment Profiles

| Profile           | Description                                |
| ----------------- | ------------------------------------------ |
| `api`             | Runs all microservices and dependencies    |
| `dev`             | Runs only Redis and Postgres               |
| `backing-service` | Only runs backing infrastructure           |
| `all`             | Alias to run all services + infrastructure |

---

## 📌 Notes

- Ensure ports `3000`, `3001`, `3333`, `4444`, `5555`, `5672`, `6379`, and `1025` are **free** before running the stack.
- You can change environment variables for each service inside the `docker-compose.yaml` file.

---

## Run tasks

To run the dev server for all the microservice:

```sh
  pnpm dev
```

To create a production bundle for all the microservice:

```sh
pnpm build
```

To see all available targets to run for a project, run:

```sh
npx nx show project auth
```

To generate a new application, use:

```sh
npx nx g @nx/nest:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/node:lib mylib
```

To generate a new library nestjs controller schematic in apps use:

```sh
npx nx g @nx/nest:<schematic> [apps | libs]/<appName>/src/app/<app-module-folder>/<schematic-name>
```

To generate a new library package use:

```sh
npx nx g @nx/nest:library libs/microservice-client
```

To generate a new application package use:

```sh
npx nx g @nx/nest:application apps/notification
```

To remove app or lib from workspace use:

```sh
npx nx generate @nx/workspace:remove --projectName=<app-or-lib-name>
```

---

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/nest?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
