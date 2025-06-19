#!/usr/bin/env bash

NC='\033[0m' # No color
RED='\033[0;31m' #
GREEN='\033[0;32m' #

branches=(main staging);
versionning=(major minor patch);
version="";
branch="";

illegal()
{
  printf "${RED}Invalid branch ${NC}%s\nAllowed branches: ${GREEN}%s${NC}\n" "$1" "${branches[*]}";
  exit 1;
}

required_args()
{
  printf "\t- branch\n\t- type"
}

main_branch()
{
  git checkout
}

# Checking if current branch is develop (following the Gitflow principles™)
if [ "$(git branch --show-current)" != "develop" ]; then
  echo -e "${RED}You are not on the <develop> branch${NC}";
  exit 3;
fi

# Developer must not have uncommitted changes.
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}You have uncommited changes, please add them and commit the changes (or stash them).${NC}";
  exit 2;
fi

# If developer forgot passing an argument
if [ $# -eq 0 ]; then
  PS3="Choose Git branch: "

  select branch in "${branches[@]}"
  do
    branch="$branch"
    break;
  done;
  # Simple check if $branch is not empty
  if [ ! "$branch" ]; then illegal ""; fi;
else
# Get the release branch from named argument
  while [ $# -gt 0 ]; do
    if [[ $1 == *"--"* ]]; then
      v="${1/--/}"
      if [[ ${branches[*]} =~ $v ]]; then
        branch="$v"
      else
        illegal "$1"
      fi
    fi
    shift
  done
fi

# If developer forgot passing an argument
if [[ "$branch" == "stage" ]] ; then
  PS3="Choose version type: "

  select version in "${versionning[@]}"
  do
    version="$version"
    break;
  done;
  # Simple check if $version is not empty
  if [ ! "$version" ]; then illegal ""; fi;


  npm version "$version"
  git push origin develop;
fi;

echo -e "\n\t>>> LAUNCHING BUILD ON ${GREEN}$branch${NC} <<<\n"

## Build logic
git checkout "$branch";
git pull origin "$branch";

if [[ "$branch" == "main" ]] ;  then
  # Create a commit message on main using version from package.json
  git fetch;
  git merge develop -m "$(node -e "console.log(require('./package.json').version)")";
else
  git pull origin develop;
fi;

git push;
git checkout develop;