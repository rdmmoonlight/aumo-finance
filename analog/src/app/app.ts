import { Component } from "@angular/core";
import { Outlet } from "@tanstack/angular-router";

@Component({
  selector: "app-root",
  imports: [Outlet],
  template: `<router-outlet />`,
})
export class App {}
