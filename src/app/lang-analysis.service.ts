import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LangAnalysisService {
  private apiKey: string = 'AIzaSyAh6mgdRoDt_LRZvsKwCDKR7sGDxuUS5Pc';
  private apiUrl: string = `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${this.apiKey}`;

  constructor(private http: HttpClient) {}

  analyzeSentiment(text: string): Observable<any> {
    const document = {
      document: {
        type: 'PLAIN_TEXT',
        content: text
      }
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(this.apiUrl, document, { headers })
      .pipe(
        catchError(error => {
          console.error('Error en la llamada a la API:', error);
          throw error; // Vuelve a lanzar el error para que pueda ser manejado donde se llama
        })
      );
  }
}
