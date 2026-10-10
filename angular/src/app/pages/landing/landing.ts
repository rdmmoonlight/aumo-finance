import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
})
export class LandingComponent {
  isMobileMenuOpen = false;
  isAnnual = true;

  toggleMenu() { this.isMobileMenuOpen = !this.isMobileMenuOpen; }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    this.isMobileMenuOpen = false;
  }
}