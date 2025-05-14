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

## 🔀 Service Types

### Transaction Service

- **Role**: Acts as the **central orchestrator** of the system.
- **Functionality**:
  - Exposes **HTTP endpoints** for client consumption.
  - Delegates work to other services via gRPC.
  - Sends emails by publishing messages to RabbitMQ.

Swagger UI: [http://localhost:3001/swagger](http://localhost:3001/swagger)

The **Transaction Service** acts as the orchestrator in the system, responsible for coordinating actions across multiple services, such as wallet debits, order creation, and sending notifications. It exposes RESTful HTTP endpoints for clients and interacts with other services using gRPC and RabbitMQ.

One of its core features is a **robust retry mechanism** for handling **Forex orders**. Each Forex order can fall into one of the following categories:

- ✅ **Success** – All operations completed successfully.
- ⚠️ **Temporary Failure** – A recoverable error such as a dependent microservice being unavailable.
- ❌ **Permanent Failure** – An unrecoverable error, often due to invalid user input (e.g., insufficient wallet balance).

**Retry Logic:**

- Orders that encounter **temporary failures** are **queued** using [BullMQ](https://docs.bullmq.io/), a Redis-backed queue library.
- These orders are retried **up to 3 times**.
- If the retries fail, the order is marked as a **permanent failure**.

This design improves user experience by reducing failed transactions caused by intermittent service outages or delays, and ensures eventual consistency in distributed workflows.

---

### Auth Service

- **Role**: Handles authentication and authorization.
- **Functionality**:
  - Exposes **HTTP endpoints** for clients (sign up, login, etc.).
  - Communicates with Wallet and Integration services using gRPC.

Swagger UI: [http://localhost:3000/swagger](http://localhost:3000/swagger)

---

### 🌐 Integration Service

The **Integration Service** is responsible for interfacing with third-party APIs, specifically for **fetching Forex exchange rates**. To ensure fast and efficient access to exchange rate data, the service leverages a **Redis-based caching mechanism**.

**Design Highlights:**

- A **cron job** runs **daily at 6:00 AM**, fetching the latest Forex exchange rates from the third-party API and storing them in Redis.
- This cached rate table is then used by other services throughout the day.

**Benefits of this Design:**

1. 🚀 **Reduced Latency** – Redis provides ultra-fast in-memory access to exchange rates, which speeds up downstream processes.
2. 💸 **Lower Costs** – Reduces the number of external API calls, cutting down on API usage fees.
3. 🔄 **Decoupled Architecture** – Other services retrieve exchange rates directly from Redis, avoiding tight coupling with the third-party API.

**Drawback:**

- ❗ Real-time market fluctuations may not be accurately reflected throughout the day since rates are refreshed only once every 24 hours. This trade-off was made in favor of speed and cost-efficiency.

To spin up the entire stack, follow these steps:

### 1. Prerequisites

- Ensure **Docker** and **Docker Compose** are installed on your machine.
- Ensure **pnpm** is installed globally. You can install it via:

  ```bash
  npm install -g pnpm
  ```

### 2. Clone the repository

### 3. Install Dependencies

At the root of the project, install all monorepo dependencies using:

```bash
pnpm install
```

### 4. Configure Integration Service Environment

Navigate to the Integration Service directory and create a .env file with your exchange rate API key:

```bash
cd apps/integration
touch docker.env
```

Then add the following line to the .env file:

```env
EXCHANGE_RATE_API_KEY=YourActualApiKeyHere
```

### 5. Start Backing Services

Run the following command from the project root to start Redis, Postgres, and RabbitMQ:

```bash
docker compose --profile backing-service up
```

### 6. Run Migrations

Run database migrations to initialize your schema:

```bash
pnpm migration:run
```

### 7. Start All Microservices

With the backing services already running, you can now start all microservices:

```bash
docker compose --profile api up
```

After following these steps, your development environment should be up and running with all services communicating as expected. 🚀

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
