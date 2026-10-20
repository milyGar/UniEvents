import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonInput, IonButton, IonText, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { ApiService } from '../services/api.service';

@Component({
  standalone: true, selector: 'app-login',
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonInput, IonButton, IonText, IonSegment, IonSegmentButton, IonLabel],
  template: `
  <ion-header><ion-toolbar><ion-title>UniEvents</ion-title></ion-toolbar></ion-header>
  <ion-content>
    <main class="auth-shell">
      <section class="auth-card panel">
        <div class="brand-mark" aria-hidden="true">✦</div>
        <p class="eyebrow">Tu campus, en un solo lugar</p>
        <h1 class="auth-title">Bienvenido a UniEvents</h1>
        <p class="auth-copy">Descubre actividades, comparte momentos y encuentra tu próximo evento favorito.</p>
        <ion-segment class="auth-segment" [(ngModel)]="modo">
          <ion-segment-button value="in"><ion-label>Iniciar sesión</ion-label></ion-segment-button>
          <ion-segment-button value="up"><ion-label>Crear cuenta</ion-label></ion-segment-button>
        </ion-segment>
        @if (modo === 'up') { <ion-item class="auth-field"><ion-input label="Nombre" labelPlacement="floating" [(ngModel)]="nombre"></ion-input></ion-item> }
        <ion-item class="auth-field"><ion-input label="Correo electrónico" type="email" labelPlacement="floating" [(ngModel)]="correo"></ion-input></ion-item>
        <ion-item class="auth-field"><ion-input label="Contraseña" type="password" labelPlacement="floating" [(ngModel)]="pass"></ion-input></ion-item>
        @if (error) { <ion-text color="danger"><p class="error-message">{{ error }}</p></ion-text> }
        <ion-button class="auth-submit" expand="block" (click)="enviar()">{{ modo === 'in' ? 'Entrar a mi cuenta' : 'Crear mi cuenta' }}</ion-button>
      </section>
    </main>
  </ion-content>`
})
export class LoginPage {
  modo = 'in'; nombre = ''; correo = ''; pass = ''; error = '';
  constructor(private api: ApiService, private router: Router) {}
  async enviar() {
    try {
      this.modo === 'in' ? await this.api.login(this.correo, this.pass) : await this.api.registro(this.nombre, this.correo, this.pass);
      this.router.navigateByUrl('/eventos');
    } catch (e: any) { this.error = e?.error?.error || 'No se pudo conectar con el servidor'; }
  }
}
