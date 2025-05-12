module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'default-admin-secret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'default-api-token-salt'),
  },
  flags: {
    noBuild: env.bool('STRAPI_ADMIN_NO_BUILD', false),
  },
  watchIgnoreFiles: [
    '**/node_modules/**',
    '**/admin/node_modules/**',
    '**/dist/**',
    '**/build/**',
  ],
});
