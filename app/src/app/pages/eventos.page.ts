import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonLabel, IonChip, IonFab, IonFabButton, ViewWillEnter } from '@ionic/angular/standalone';
import { ApiService, Evento } from '../services/api.service';

@Component({
  standalone: true, selector: 'app-eventos',
  imports: [RouterLink, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonLabel, IonChip, IonFab, IonFabButton],
  template: `
  <ion-header><ion-toolbar><ion-title>UniEvents</ion-title>
    <ion-buttons slot="end"><ion-button (click)="salir()">Salir</ion-button></ion-buttons></ion-toolbar></ion-header>
  <ion-content>
    <main class="page-wrap">
      <section class="events-hero panel">
        <div><p class="eyebrow">Vive tu comunidad</p><h1 class="page-heading">Encuentra tu próximo plan</h1><p>Actividades para aprender, conectar y disfrutar en el campus.</p></div>
        <div class="hero-count"><strong>{{ eventos.length }}</strong><span>eventos</span></div>
      </section>
      <section class="filter-panel panel" aria-label="Filtrar eventos">
        <p class="eyebrow">Explora por categoría</p>
        <div class="filter-scroll">
          @for (c of cats; track c) { <ion-chip color="primary" [outline]="c !== filtro" (click)="filtro = c">{{ c }}</ion-chip> }
        </div>
      </section>
      <section aria-label="Lista de eventos">
        @if (visibles().length) {
          <ion-list class="event-list">
            @for (e of visibles(); track e._id) {
              <ion-item class="event-item" [routerLink]="['/evento', e._id]" detail>
                <ion-label>
                  <h2 class="event-title">{{ e.titulo }}</h2>
                  <p class="event-meta">{{ e.fecha }} · {{ e.hora }} h · {{ e.lugar }}</p>
                </ion-label>
                @if (api.esAdmin) {
                  <div class="event-actions" slot="end">
                    <ion-button size="small" fill="outline" [routerLink]="['/admin/editar', e._id]" (click)="$event.stopPropagation()">Editar</ion-button>
                    <ion-button size="small" fill="outline" color="danger" (click)="borrar(e, $event)">Eliminar</ion-button>
                  </div>
                }
              </ion-item>
            }
          </ion-list>
        } @else {
          <div class="empty-state panel"><div class="empty-icon">✦</div><h2>No hay eventos por aquí</h2><p class="muted">Prueba otra categoría o vuelve más tarde.</p></div>
        }
      </section>
    </main>
    @if (api.esAdmin) { <ion-fab slot="fixed" vertical="bottom" horizontal="end"><ion-fab-button routerLink="/admin/nuevo" aria-label="Crear evento">+</ion-fab-button></ion-fab> }
  </ion-content>`
})
export class EventosPage implements ViewWillEnter {
  eventos: Evento[] = []; cats = ['Todos', 'Conferencia', 'Taller', 'Cultural', 'Deportivo', 'Académico']; filtro = 'Todos';
  constructor(public api: ApiService, private router: Router) {}
  async ionViewWillEnter() { try { this.eventos = await this.api.eventos(); } catch { this.salir(); } }
  visibles() { return this.eventos.filter(e => this.filtro === 'Todos' || e.cat === this.filtro); }
  async borrar(e: Evento, ev: Event) { ev.stopPropagation(); if (confirm('¿Eliminar este evento?')) { await this.api.borrar(e._id!); this.eventos = await this.api.eventos(); } }
  salir() { this.api.salir(); this.router.navigateByUrl('/login'); }
}
