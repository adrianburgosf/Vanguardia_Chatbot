import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:3978/api/messages'; 

  constructor(private http: HttpClient) {}

  // Método para enviar mensajes al bot
  sendMessage(message: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      type: 'message',
      text: message
    };

    return this.http.post(this.apiUrl, body, { headers });
  }
}
