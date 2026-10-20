import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { ApiService, Evento } from '../services/api.service';

@Component({
  standalone: true, selector: 'app-detalle', imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton],
  template: `
  <ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/eventos"></ion-back-button></ion-buttons><ion-title>UniEvents</ion-title></ion-toolbar></ion-header>
  <ion-content>
    <main class="page-wrap">
      @if (e(); as evento) {
        <article class="detail-card panel">
          <div class="detail-topline"><p class="eyebrow">Todo sobre este evento</p><span class="category-pill">{{ evento.cat }}</span></div>
          <h1 class="detail-title">{{ evento.titulo }}</h1>
          <section class="detail-facts" aria-label="Información del evento">
            <div class="fact-card"><span class="fact-label">Fecha</span><span class="fact-value">{{ evento.fecha }}</span></div>
            <div class="fact-card"><span class="fact-label">Hora</span><span class="fact-value">{{ evento.hora }} h</span></div>
            <div class="fact-card"><span class="fact-label">Lugar</span><span class="fact-value">{{ evento.lugar }}</span></div>
          </section>
          @if (evento.desc) { <p class="detail-description">{{ evento.desc }}</p> }
          @if (evento.lat != null && evento.lng != null) {
            <iframe class="map-frame" [src]="mapa()" title="Mapa del lugar del evento"></iframe>
          } @else if (evento.dir) {
            <div class="map-placeholder"><span class="fact-label">Mapa del lugar</span><p>No se encontraron coordenadas para esta dirección. Edita el evento y agrega una dirección más completa para mostrar el mapa aquí.</p></div>
          }
        </article>
      }
    </main>
  </ion-content>`
})
export class DetallePage {
  e = signal<Evento | undefined>(undefined);
  constructor(r: ActivatedRoute, api: ApiService, private sanitizer: DomSanitizer) { api.evento(r.snapshot.paramMap.get('id')!).then(x => this.e.set(x)); }
  mapa(): SafeResourceUrl {
    const lat = this.e()!.lat!, lng = this.e()!.lng!;
    const bbox = `${lng - 0.004},${lat - 0.004},${lng + 0.004},${lat + 0.004}`;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
