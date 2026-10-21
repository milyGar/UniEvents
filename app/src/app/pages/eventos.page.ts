import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonChip, IonFab, IonFabButton, ViewWillEnter } from '@ionic/angular/standalone';
import { ApiService, Evento } from '../services/api.service';

@Component({
  standalone: true, selector: 'app-eventos',
  imports: [RouterLink, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonChip, IonFab, IonFabButton],
  template: `
  <ion-header><ion-toolbar><ion-title>UniEvents</ion-title>
    <ion-buttons slot="end"><ion-button (click)="salir()">Salir</ion-button></ion-buttons></ion-toolbar></ion-header>
  <ion-content>
    <main class="page-wrap">
      <section class="events-hero panel">
        <div><p class="eyebrow">Vive tu comunidad</p><h1 class="page-heading">Encuentra tu próximo plan</h1><p>Actividades para aprender, conectar y disfrutar en el campus.</p></div>
        <div class="hero-count"><strong>{{ eventos.length }}</strong><span>{{ eventos.length === 1 ? 'evento' : 'eventos' }}</span></div>
      </section>

      <section class="filter-panel panel" aria-label="Filtrar eventos">
        <div class="filter-heading"><div><p class="eyebrow">Tu próximo plan está aquí</p><h2>Explora eventos</h2></div><span class="results-count">{{ visibles().length }} resultados</span></div>
        <label class="event-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Busca por evento, lugar o descripción" [value]="busqueda" (input)="busqueda = $any($event.target).value" aria-label="Buscar eventos"></label>
        <div class="filter-row">
          <div class="category-filters" aria-label="Filtrar por categoría">
            @for (c of cats; track c) { <ion-chip color="primary" [outline]="c !== filtro" (click)="filtro = c">{{ c }}</ion-chip> }
          </div>
          <label class="date-filter"><span>Fecha</span><input type="date" [value]="fechaFiltro" (change)="fechaFiltro = $any($event.target).value" aria-label="Filtrar por fecha"></label>
        </div>
        @if (busqueda || fechaFiltro || filtro !== 'Todos') {
          <button class="clear-filters" type="button" (click)="limpiarFiltros()">Limpiar filtros</button>
        }
      </section>

      <section class="event-grid" aria-label="Lista de eventos">
        @if (visibles().length) {
          @for (e of visibles(); track e._id) {
            <article class="event-card panel">
              <a class="event-card-main" [routerLink]="['/evento', e._id]">
                <div class="event-card-top"><span class="event-category">{{ iconoCategoria(e.cat) }} {{ e.cat }}</span><span class="event-arrow" aria-hidden="true">↗</span></div>
                <div class="event-card-content">
                  <div class="event-date-badge"><strong>{{ fechaDia(e.fecha) }}</strong><span>{{ fechaMes(e.fecha) }}</span></div>
                  <div class="event-card-copy"><h2 class="event-title">{{ e.titulo }}</h2><p class="event-card-place">⌖ {{ e.lugar }}</p></div>
                </div>
                <div class="event-card-footer"><span>◷ {{ e.hora }} h</span>@if (e.dir) { <span class="event-has-map">Ver ubicación</span> }</div>
              </a>
              @if (api.esAdmin) {
                <div class="event-actions">
                  <ion-button size="small" fill="clear" [routerLink]="['/admin/editar', e._id]">Editar</ion-button>
                  <ion-button size="small" fill="clear" color="danger" (click)="borrar(e, $event)">Eliminar</ion-button>
                </div>
              }
            </article>
          }
        } @else {
          <div class="empty-state panel"><div class="empty-icon">✦</div><h2>No encontramos eventos</h2><p class="muted">Prueba otra búsqueda o cambia los filtros.</p><ion-button fill="outline" (click)="limpiarFiltros()">Ver todos</ion-button></div>
        }
      </section>
    </main>
    @if (api.esAdmin) { <ion-fab slot="fixed" vertical="bottom" horizontal="end"><ion-fab-button routerLink="/admin/nuevo" aria-label="Crear evento">+</ion-fab-button></ion-fab> }
  </ion-content>`
})
export class EventosPage implements ViewWillEnter {
  eventos: Evento[] = [];
  cats = ['Todos', 'Conferencia', 'Taller', 'Cultural', 'Deportivo', 'Académico'];
  filtro = 'Todos';
  busqueda = '';
  fechaFiltro = '';

  constructor(public api: ApiService, private router: Router) {}
  async ionViewWillEnter() { try { this.eventos = await this.api.eventos(); } catch { this.salir(); } }

  visibles() {
    const q = this.normalizar(this.busqueda.trim());
    return this.eventos.filter(e => {
      const coincideCategoria = this.filtro === 'Todos' || e.cat === this.filtro;
      const coincideFecha = !this.fechaFiltro || e.fecha === this.fechaFiltro;
      const texto = this.normalizar([e.titulo, e.cat, e.lugar, e.dir, e.desc].filter(Boolean).join(' '));
      return coincideCategoria && coincideFecha && (!q || texto.includes(q));
    }).sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
  }

  fechaDia(fecha: string) {
    const d = this.parseFecha(fecha);
    return d ? new Intl.DateTimeFormat('es-MX', { day: '2-digit' }).format(d) : '—';
  }
  fechaMes(fecha: string) {
    const d = this.parseFecha(fecha);
    return d ? new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(d).replace('.', '') : 'fecha';
  }
  iconoCategoria(cat: string) {
    return ({ Conferencia: '◉', Taller: '✳', Cultural: '✦', Deportivo: '⚡', Académico: '▤' } as Record<string, string>)[cat] || '✦';
  }
  limpiarFiltros() { this.busqueda = ''; this.fechaFiltro = ''; this.filtro = 'Todos'; }
  async borrar(e: Evento, ev: Event) { ev.stopPropagation(); if (confirm('¿Eliminar este evento?')) { await this.api.borrar(e._id!); this.eventos = await this.api.eventos(); } }
  salir() { this.api.salir(); this.router.navigateByUrl('/login'); }

  private normalizar(texto: string) { return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es'); }
  private parseFecha(fecha: string) {
    const d = new Date(`${fecha}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
}
