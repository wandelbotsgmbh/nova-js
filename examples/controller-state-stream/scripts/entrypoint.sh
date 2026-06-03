#!/bin/sh

# Inject the base path from the runtime environment on first Docker startup
# even though NextJS inlines env variables at build time
if [ ! -f .basepath ]; then
  echo "First startup, setting BASE_PATH to $BASE_PATH in build"
  rg "__REPLACE_ME_BASE_PATH__" -Fl .next server.js | xargs sed -i "s#__REPLACE_ME_BASE_PATH__#${BASE_PATH: 1}#g"
  touch .basepath
fi

# Conditionally set the --inspect flag for non-production builds
if [ "$NODE_ENV" = "development" ]; then
  exec node --inspect server.js
else
  exec node server.js
fi