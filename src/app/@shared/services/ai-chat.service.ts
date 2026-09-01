import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AIChatService {
  private dbName = 'AICacheDB';
  private db: IDBDatabase | null = null;
  private readonly DB_VERSION = 1;

  constructor() {
    this.initDB();
  }

  // ==================== INDEXEDDB SETUP ====================
  private initDB(): void {
    const request = indexedDB.open(this.dbName, this.DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('chat_cache')) {
        db.createObjectStore('chat_cache');
      }
    };
    request.onsuccess = () => { this.db = request.result; };
  }

  private async getHash(query: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(query);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // ==================== CACHE OPERATIONS ====================
  private async getFromCache(hash: string): Promise<{text: string, sources: string[]} | null> {
    if (!this.db) return null;
    return new Promise((resolve) => {
      const transaction = this.db!.transaction('chat_cache', 'readonly');
      const store = transaction.objectStore('chat_cache');
      const request = store.get(hash);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  private async saveToCache(hash: string, data: {text: string, sources: string[]}): Promise<void> {
    if (!this.db) return;
    const transaction = this.db.transaction('chat_cache', 'readwrite');
    transaction.objectStore('chat_cache').put(data, hash);
  }

  // ==================== MAIN SERVICE ====================
  async sendMessage(
    query: string,
    history: any[],
    onToken: (token: string) => void,
    onSources: (sources: string[]) => void
  ): Promise<void> {
    const hash = await this.getHash(query);

    // 1. Try Cache
    const cached = await this.getFromCache(hash);
    if (cached) {
      this.streamSimulatedResponse(cached.text, cached.sources, onToken, onSources);
      return;
    }

    // 2. NETWORK PATH (Cache Miss)
    const response = await fetch(`${environment.apiUrl}/view/endpoint/chat/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history })
    });

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let fullSources: string[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        chunk.split('\n\n').forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.replace('data: ', ''));
              if (payload.type === 'token') {
                onToken(payload.text);
                fullText += payload.text;
              } else if (payload.type === 'sources') {
                onSources(payload.data);
                fullSources = payload.data;
              }
            } catch (e) {}
          }
        });
      }
      // 3. Save to Cache after successful network stream
      this.saveToCache(hash, { text: fullText, sources: fullSources });
    } catch (err) {
      throw err;
    }
  }

  // ==================== UTILS ====================
  private streamSimulatedResponse(text: string, sources: string[], onToken: Function, onSources: Function): void {
    onSources(sources);
    // Split into 5-character chunks for "typing" effect
    const chunks = text.match(/.{1,5}/g) || [];
    let i = 0;
    const interval = setInterval(() => {
      onToken(chunks[i++]);
      if (i >= chunks.length) clearInterval(interval);
    }, 30);
  }
}