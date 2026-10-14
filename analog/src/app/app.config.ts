import { provideFileRouter, withExtraRoutes } from '@analogjs/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';

import { authInterceptor } from './core/auth.interceptor';
import { customRoutes } from './routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(withExtraRoutes(customRoutes)),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};