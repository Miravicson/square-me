# SquareMe

## Setup

1. Install `nodejs "^20.0.0"`
2. Install `pnpm`
3. Install `Docker` and `docker-compose`

## Starting the app with docker

1. Start the backing services -- Redis, Postgres, RabbitMq, Mailhog

```sh
docker compose --profile backing-service up
```

2. Run migrations for auth, transaction and wallet

```sh
pnpm migration:run
```

3. Start the microservice app

```sh
docker compose --profile api up
```

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
