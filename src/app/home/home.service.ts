import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Quotations, QuotationsGridColumns } from './home.model';

import Settings from '../settings.json';

@Injectable()
export class HomeService {
  constructor(private http: HttpClient) { }

  private _settings = Settings;

  public GetQuotations(): Observable<Quotations[]> {
    return this.http.get<Quotations[]>(this._settings.AppSettings.APIBaseUrl + "Quotation/GetQuotations");
  }

  public GetQuotationsGridColumns(): Observable<QuotationsGridColumns[]> {
    return this.http.get<QuotationsGridColumns[]>(this._settings.AppSettings.APIBaseUrl + "Quotation/GetQuotationsGridColumns");
  }
}
