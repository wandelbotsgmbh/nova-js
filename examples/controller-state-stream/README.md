# Next.js NOVA app template 

This template provides the skeleton of a [Next.js](https://nextjs.org/) robot application built to run on [Wandelbots NOVA](https://docs.wandelbots.io/). 

You can generate a new project with the [NOVA CLI](https://portal.wandelbots.io/en/download) by running `nova app create myapp -g "nextjs_app"`.

⚡ Next.js with App Router support

🔥 Type checking with TypeScript

📏 Linting & Formatting with Biome

## Development setup

First install [pnpm](https://pnpm.io/), which is used to manage the node version as well as the packages. 

## Installing dependencies

```bash
pnpm install
```

## Local development with a NOVA instance

You can run your app locally for development and connect it to a remote NOVA instance by providing the `NOVA_DEV_INSTANCE_URL`, `NOVA_DEV_ACCESS_TOKEN` and `CELL_ID` environment variables in `.env.local`. 

For example, if your instance is at `my.instance.wandelbots.io` and your cell is called `cell`:

```bash
NOVA_DEV_INSTANCE_URL=https://my.instance.wandelbots.io
NOVA_DEV_ACCESS_TOKEN="..."
CELL_ID=cell
```

## Running the dev server

Once everything is set up, you can run the NextJS dev server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploying your app to a NOVA instance

If you have the NOVA CLI set up to [work with Docker](https://docs.wandelbots.io/latest/developing-typescript-quickstart#set-up-docker-and-registries), you can deploy your NOVA app into a robot cell directly from the repo using the provided `Dockerfile`:

```bash
nova app install .
```