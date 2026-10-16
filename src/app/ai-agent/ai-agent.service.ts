import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AiAgentAction {
  type: string;
  label: string;
  route: any[];
  state?: { [key: string]: any };
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: AiAgentAction[];
  toolsUsed?: string[];
  isError?: boolean;
  time?: Date;
}

export interface AiChatPageContext {
  route: string;
  packageId?: number;
  packageName?: string;
}

export interface AiChatRequest {
  messages: { role: string; content: string }[];
  costConn: string;
  projectName?: string;
  userName?: string;
  page?: AiChatPageContext;
}

export interface AiChatResponse {
  reply: string;
  actions: AiAgentAction[];
  toolsUsed: string[];
}

/** AI Vendan Agent – keeps the conversation alive while the user navigates between pages. */
@Injectable({ providedIn: 'root' })
export class AiAgentService {
  private baseUrl = environment.baseApiUrl + 'api/AiAgent/';

  /** conversation kept in memory for the whole session (cleared on "New chat" or page refresh) */
  messages: AiChatMessage[] = [];
  isOpen = false;

  constructor(private http: HttpClient) {}

  chat(body: AiChatRequest): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(this.baseUrl + 'Chat', body);
  }

  status(): Observable<{ configured: boolean; model: string; name: string }> {
    return this.http.get<any>(this.baseUrl + 'Status');
  }

  reset(): void {
    this.messages = [];
  }
}
