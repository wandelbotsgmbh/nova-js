#!/bin/sh
set -e

# Inject the runtime BASE_PATH into the built static assets.
# We use the placeholder /__REPLACE_ME_BASE_PATH__/ at build time so it can
# be rewritten at container startup (NOVA OS provides BASE_PATH per cell).
if [ ! -f .basepath ]; then
  echo "First startup: setting BASE_PATH to '${BASE_PATH}' in built assets"
  rg "__REPLACE_ME_BASE_PATH__" -Fl dist | xargs -r sed -i "s#/__REPLACE_ME_BASE_PATH__#${BASE_PATH}#g"
  touch .basepath
fi

# Inject runtime environment variables for the SPA via window.__NOVA_ENV__.
# Regenerated on every startup so env changes take effect on restart.
cat > dist/config.js <<EOF
window.__NOVA_ENV__ = {
  NOVA_DEV_INSTANCE_URL: "${NOVA_DEV_INSTANCE_URL}",
  NOVA_DEV_ACCESS_TOKEN: "${NOVA_DEV_ACCESS_TOKEN}",
  CELL_ID: "${CELL_ID}"
};
EOF

# Ensure index.html loads config.js before the app bundle.
if ! grep -q "config.js" dist/index.html; then
  sed -i 's#</head>#<script src="'"${BASE_PATH}"'/config.js"></script></head>#' dist/index.html
fi

exec node server.js
