import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { routes } from './app.routes';
import { KeycloakAuthService } from './services/keycloak.service';

export function initializeKeycloak(keycloakService: KeycloakAuthService) {
  return () => keycloakService.initKeycloak();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    KeycloakService,
    KeycloakAuthService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [KeycloakAuthService],
      multi: true
    }
  ]
};