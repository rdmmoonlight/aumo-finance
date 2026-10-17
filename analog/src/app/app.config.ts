import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from "@angular/common/http";
import { ApplicationConfig } from "@angular/core";
import { createRouter, provideTanStackRouter } from "@tanstack/angular-router";

import { authInterceptor } from "./interceptors/auth.interceptor";
import { routeTree } from "./routeTree.gen"; // atau pohon rute gabungan dari ./routes

const router = createRouter({ routeTree });

declare module "@tanstack/angular-router" {
  interface Register {
    router: typeof router;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideTanStackRouter(router),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
