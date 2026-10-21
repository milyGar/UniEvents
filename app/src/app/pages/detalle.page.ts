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
          @if (evento.dir || (evento.lat != null && evento.lng != null)) {
            <section class="event-map" aria-label="Mapa del lugar del evento">
              <div class="event-map-heading">
                <div><p class="eyebrow">Cómo llegar</p><h2 class="map-title">Mapa del lugar</h2></div>
                @if (evento.dir) { <p class="map-address">{{ evento.dir }}</p> }
              </div>
              <iframe class="map-frame" [src]="mapa(evento)" title="Mapa del lugar del evento" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </section>
          }
        </article>
      }
    </main>
  </ion-content>`
})
export class DetallePage {
  e = signal<Evento | undefined>(undefined);
  constructor(r: ActivatedRoute, api: ApiService, private sanitizer: DomSanitizer) { api.evento(r.snapshot.paramMap.get('id')!).then(x => this.e.set(x)); }
  mapa(evento: Evento): SafeResourceUrl {
    let url: string;
    if (evento.lat != null && evento.lng != null) {
      const lat = evento.lat, lng = evento.lng;
      const bbox = `${lng - 0.004},${lat - 0.004},${lng + 0.004},${lat + 0.004}`;
      url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    } else {
      // Aún se puede mostrar la ubicación aproximada si el evento viejo no tiene coordenadas.
      const consulta = [evento.dir, evento.lugar, 'Aguascalientes, México'].filter(Boolean).join(', ');
      url = `https://www.google.com/maps?q=${encodeURIComponent(consulta)}&output=embed`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
