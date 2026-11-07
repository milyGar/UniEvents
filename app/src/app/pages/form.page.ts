import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonText } from '@ionic/angular/standalone';
import { ApiService, Evento } from '../services/api.service';
import { environment } from '../../environments/environment';

type SugerenciaDireccion = { id: string | number; nombre: string; lat: number; lng: number };

@Component({
  standalone: true, selector: 'app-form',
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonItem, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonText],
  template: `
  <ion-header><ion-toolbar><ion-buttons slot="start"><ion-back-button defaultHref="/eventos"></ion-back-button></ion-buttons><ion-title>UniEvents</ion-title></ion-toolbar></ion-header>
  <ion-content>
    <main class="page-wrap">
      <section class="form-card panel">
        <p class="eyebrow">Comparte algo que valga la pena</p>
        <h1 class="page-heading">{{ id ? 'Editar evento' : 'Crear un evento' }}</h1>
        <p class="form-intro">Completa la información para que la comunidad pueda encontrar y disfrutar tu evento.</p>
        <ion-item class="form-field"><ion-input label="Título del evento" labelPlacement="floating" [(ngModel)]="e.titulo"></ion-input></ion-item>
        <ion-item class="form-field"><ion-select label="Categoría" labelPlacement="floating" [(ngModel)]="e.cat">@for (c of cats; track c) { <ion-select-option [value]="c">{{ c }}</ion-select-option> }</ion-select></ion-item>
        <ion-item class="form-field"><ion-input label="Fecha" type="date" labelPlacement="stacked" [(ngModel)]="e.fecha"></ion-input></ion-item>
        <ion-item class="form-field"><ion-input label="Hora" type="time" labelPlacement="stacked" [(ngModel)]="e.hora"></ion-input></ion-item>
        <ion-item class="form-field"><ion-input label="Lugar" labelPlacement="floating" [(ngModel)]="e.lugar"></ion-input></ion-item>
        <ion-item class="form-field"><ion-input label="Dirección" labelPlacement="floating" [(ngModel)]="e.dir" (ionInput)="programarBusquedaDireccion($event)"></ion-input></ion-item>
        @if (buscandoUbicacion()) { <p class="search-status">Buscando lugares…</p> }
        @if (errorBusqueda()) { <p class="error-message">{{ errorBusqueda() }}</p> }
        @if (sugerencias().length) {
          <div class="location-suggestions">
            <p class="fact-label">Elige la ubicación correcta</p>
            @for (s of sugerencias(); track s.id) { <button type="button" class="location-suggestion" (click)="seleccionarDireccion(s)">{{ s.nombre }}</button> }
            <small>Resultados de OpenStreetMap</small>
          </div>
        }
        <p class="muted">Empieza con una calle, lugar o colonia. Elige una sugerencia para guardar el punto en el mapa.</p>
        <ion-item class="form-field"><ion-textarea label="Descripción" labelPlacement="floating" autoGrow="true" [(ngModel)]="e.desc"></ion-textarea></ion-item>
        @if (error) { <ion-text color="danger"><p class="error-message">{{ error }}</p></ion-text> }
        <ion-button class="form-submit" expand="block" (click)="guardar()">{{ id ? 'Guardar cambios' : 'Publicar evento' }}</ion-button>
      </section>
    </main>
  </ion-content>`
})
export class FormPage {
  cats = ['Conferencia', 'Taller', 'Cultural', 'Deportivo', 'Académico'];
  sugerencias = signal<SugerenciaDireccion[]>([]);
  buscandoUbicacion = signal(false);
  errorBusqueda = signal('');
  id = this.r.snapshot.paramMap.get('id'); error = '';
  e: Evento = { titulo: '', cat: 'Conferencia', fecha: '', hora: '', lugar: '', dir: '', desc: '' };
  private temporizadorBusqueda?: ReturnType<typeof setTimeout>;
  private solicitudBusqueda = 0;

  constructor(private r: ActivatedRoute, private api: ApiService, private router: Router) { if (this.id) api.evento(this.id).then(x => this.e = x); }

  programarBusquedaDireccion(evento: CustomEvent) {
    const consulta = String((evento as any).detail?.value || '').trim();
    this.e.dir = consulta;
    this.e.lat = undefined; this.e.lng = undefined;
    this.sugerencias.set([]); this.errorBusqueda.set(''); this.buscandoUbicacion.set(false);
    const solicitud = ++this.solicitudBusqueda;
    if (this.temporizadorBusqueda) clearTimeout(this.temporizadorBusqueda);
    if (consulta.length < 3) return;
    this.temporizadorBusqueda = setTimeout(() => this.buscarDirecciones(consulta, solicitud), 650);
  }

  private async buscarDirecciones(consulta: string, solicitud: number) {
    this.buscandoUbicacion.set(true); this.errorBusqueda.set('');
    try {
      const contexto = (this.e.lugar || '').trim();
      const url = `${environment.apiUrl}/events/buscar-direcciones?q=${encodeURIComponent(consulta)}&contexto=${encodeURIComponent(contexto)}`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${this.api.token}` } });
      if (response.status === 401) throw new Error('Tu sesión venció. Cierra sesión y vuelve a entrar.');
      if (response.status === 404) throw new Error('El backend aún no tiene la búsqueda nueva. Reinícialo con Ctrl+C y npm start.');
      const datos = await response.json().catch(() => null);
      if (!response.ok) {
        const detalle = typeof datos?.error === 'string' ? datos.error : '';
        throw new Error(detalle || `El servidor respondió con error ${response.status}.`);
      }
      const resultados: SugerenciaDireccion[] = datos;
      if (solicitud !== this.solicitudBusqueda) return;
      this.sugerencias.set(resultados);
      if (!resultados.length) this.errorBusqueda.set('No encontramos coincidencias. Prueba con otro nombre o una calle cercana.');
    } catch (error) {
      if (solicitud === this.solicitudBusqueda) {
        const mensaje = error instanceof TypeError
          ? 'No se pudo conectar con la API. Confirma que el backend siga activo y que CORS permita http://localhost:8100.'
          : error instanceof Error ? error.message : 'No se pudo buscar el lugar.';
        this.errorBusqueda.set(mensaje);
      }
    } finally {
      if (solicitud === this.solicitudBusqueda) this.buscandoUbicacion.set(false);
    }
  }

  seleccionarDireccion(s: SugerenciaDireccion) {
    this.solicitudBusqueda++;
    if (this.temporizadorBusqueda) clearTimeout(this.temporizadorBusqueda);
    this.e.dir = s.nombre; this.e.lat = s.lat; this.e.lng = s.lng;
    this.sugerencias.set([]); this.errorBusqueda.set('');
  }

  async guardar() {
    try { this.id ? await this.api.editar(this.id, this.e) : await this.api.crear(this.e); this.router.navigateByUrl('/eventos'); }
    catch (x: any) { this.error = x?.error?.error || 'No se pudo guardar'; }
  }
}
