#!/usr/bin/env bash
printf "\n\t>>> PUSHING TO STAGING NOW <<<\n"

if ! grep -qc "Dev" "$HOME/.ssh/config"; then
  printf "You don't have 'Dev' set up in your SSH config.\n";
  printf "Exiting...\n";

  exit;
fi;

## Push .env to remote
scp .env Dev:~/.env # We'll move it later.

## Deployment logic
ssh -t Dev <<DEPLOY
  . ~/.zshrc && # Sourcing local server profile
  projects node press && # CD to project's base folder
  mv ~/.env ./ && # Moving the .env file we created
  Git press pull origin main && # Pulling latest changes using the "press" deploy key
  rm -rf node_modules &&
  bun i && # Install packages
  git restore . && # Resetting potential bun.lockb changes to avoid conflicts
  bun run build &&
  pm2 stop all && ORIGIN=http://172.16.104.128:3000 pm2 start build/index.js --watch --update-env -- --port 3000 && # Building, stopping and restarting server
  pm2 ls
DEPLOY

git checkout main