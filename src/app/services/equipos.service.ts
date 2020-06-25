import { Injectable } from '@angular/core';
import { Equipo } from '../models/equipo';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: "root"
})
export class EquiposService {
  resourceURL: string;
  constructor(private httpClient: HttpClient) {
    this.resourceURL = "https://pavii.ddns.net/api/Equipos/";
  }
  get():Observable<Equipo[]> {
    return this.httpClient.get<Equipo[]>(this.resourceURL);
  }

  getById(Id: number) {
    return this.httpClient.get(this.resourceURL + Id);
  }

  post(obj: Equipo) {
    return this.httpClient.post(this.resourceURL, obj);
  }

  put(Id: number, obj: Equipo) {
    return this.httpClient.put(this.resourceURL + Id, obj);
  }

  delete(Id) {
    return this.httpClient.delete(this.resourceURL + Id);
  }
}