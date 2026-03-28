export const keycloakConfig = {
  url: 'http://localhost:8081',
  realm: 'scolarite',
  clientId: 'springboot-app'
};

export const environment = {
  production: false,
  keycloak: keycloakConfig
};