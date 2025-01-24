#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

disallowed_branches=("develop" "testing")

# If the current commit ref branch points to a disallowed branches.
# We still want PRs to build, and let staging + main do the thing :)
if [[ ${disallowed_branches[*]} =~ $VERCEL_GIT_COMMIT_REF ]] ; then
  # Don't build
  echo "🛑 - Build cancelled, current branch is $VERCEL_GIT_COMMIT_REF"
  exit 0;

else
  # Proceed with the build
  echo "✅ - Build can proceed, current branch is $VERCEL_GIT_COMMIT_REF"
  exit 1;
fi