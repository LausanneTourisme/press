# Press Kit <small>(running on svelte 😎)</small>

## Prerequisites

### Node

This project follow the availabilities of [Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
Please install [`nvm`](https://github.com/nvm-sh/nvm) to manage your Node versions:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Then, the `package.json` file handles automatic node version.

### Bun

This project uses [`bun`](https://bun.sh/), simply because it's super fast. Install it with:
```bash
curl -fsSL https://bun.sh/install | bash
# or
npm install -g bun
```

> Simply replace your usual `npm <command>` with `bun <command>`, it will work most of the time.

### Doppler

This project stores secrets in `doppler`, but doesn't require a login. Instead, you should download an `.env` file directly in the dashboard and put it in the root of this project.

## Deploy

Run:
```bash
bun run deploy
```

And answer the prompts.

Alternatively, you may run:
```bash
bun run deploy --staging # to directly create a staging release
```
then
```bash
bun run deploy --main # to directly deploy to main
```

> Please allow a deploy time of 5 minutes. Vercel usually wants to build the <develop> branch but the `vercel-deploy.sh` script in this project prevents the build.

### Production environment
The following URL points to the `main` branch: [https://press.lausanne-tourisme.ch](https://press.lausanne-tourisme.ch)

### Staging environment
The following URL points to the `staging` branch: [https://press.stage.lausanne-tourisme.ch](https://press.stage.lausanne-tourisme.ch)

## Install

Clone this repository:

```bash
git clone git@github.com:LausanneTourisme/press press && cd press
```

Install the dependencies:

```bash
bun i
```

Run the project using:
```bash
bun run dev
```

Happy development!

## Managing translations

This project uses the `svelte-i18n` package to manage locales and translations.
In order for you to avoid adding keys in every language manually, a convenient script has been defined in `package.json`:

```bash
bun run translations:scan
```

This script will scan all `html`, `ts`, `js`, `svelte` files and add translations keys if they don't exist already in every language.

Run this script anytime you add, modify, or delete keys using the `{$_('key')}` syntax in `svelte` files.

If a key was changed or deleted, those keys will also be deleted from every locale file.

Alternatively, you may also use the `translations:sync` command to synchronize translations keys from the `fr.json` locale file to the other languages.

## Managing medias

A local "registry" file, located in `app/cache`, lists all the files that have been uploaded to Cloudinary. This file prevents re-upload and easy diffing between new files and existing ones.

However, if you'd like to rename a file, bear in mind that you should edit the registry file, as well as modifying files on [Cloudinary](https://www.cloudinary.com/console).

Alternatively you may delete the old file, and add a new one with a different name.

> Cloudinary has no `invalidate` link so the old file may still reside in their cache.

## Development mantra

### Styling

This project uses `Tailwind`, the `Typography` plugin and `Daisy UI`. So, by default, you should always develop for mobile before testing a bigger resolution.

In your `svelte` files, you may be tempted to use logic for your `CSS` class, but bear in mind that `tailwind` only looks for fully-qualified classes for them to be recognized.