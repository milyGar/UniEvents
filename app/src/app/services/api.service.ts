import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Evento { _id?: string; titulo: string; cat: string; fecha: string; hora: string; lugar: string; dir?: string; desc?: string; lat?: number; lng?: number; }

// Patrón Singleton: Angular crea una sola instancia (providedIn: 'root')
@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;
  user: { nombre: string; correo: string; rol: string } | null = null;
  constructor(private http: HttpClient) {
    const u = sessionStorage.getItem('user'); if (u) this.user = JSON.parse(u);
  }
  get token() { return sessionStorage.getItem('token'); }
  get esAdmin() { return this.user?.rol === 'admin'; }
  private h() { return { headers: new HttpHeaders({ Authorization: 'Bearer ' + this.token }) }; }

  async login(correo: string, pass: string) { this.guardar(await firstValueFrom(this.http.post<any>(this.base + '/auth/login', { correo, pass }))); }
  async registro(nombre: string, correo: string, pass: string) { this.guardar(await firstValueFrom(this.http.post<any>(this.base + '/auth/register', { nombre, correo, pass }))); }
  private guardar(r: any) { sessionStorage.setItem('token', r.token); sessionStorage.setItem('user', JSON.stringify(r.user)); this.user = r.user; }
  salir() { sessionStorage.clear(); this.user = null; }

  eventos() { return firstValueFrom(this.http.get<Evento[]>(this.base + '/events', this.h())); }
  evento(id: string) { return firstValueFrom(this.http.get<Evento>(this.base + '/events/' + id, this.h())); }
  crear(e: Evento) { return firstValueFrom(this.http.post<Evento>(this.base + '/events', e, this.h())); }
  editar(id: string, e: Evento) { return firstValueFrom(this.http.put<Evento>(this.base + '/events/' + id, e, this.h())); }
  borrar(id: string) { return firstValueFrom(this.http.delete(this.base + '/events/' + id, this.h())); }
}
