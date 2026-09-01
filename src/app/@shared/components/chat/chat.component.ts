import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { AIChatService } from '../../services/ai-chat.service';

interface Message { 
  sender: 'user' | 'ai'; 
  text: string;
  sources?: string[];
  timestamp?: Date;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;
  
  isChatOpen: boolean = false;
  messages: Message[] = [];
  isThinking: boolean = false;
  isProcessing: boolean = false;
  errorMessage: string | null = null;
  
  private history: any[] = [];
  private shouldScroll: boolean = false;

  constructor(
    private aiChatService: AIChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupKeyboardShortcuts();
    this.loadChatHistory();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.keyboardHandler);
  }

  private keyboardHandler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
    }
    if (e.key === 'Escape') {
      this.closeChat();
    }
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', this.keyboardHandler);
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    this.shouldScroll = true;
  }

  closeChat(): void {
    this.isChatOpen = false;
  }

  handleKeyDown(event: KeyboardEvent, inputEl: HTMLInputElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage(inputEl);
    }
  }

  async sendMessage(inputEl: HTMLInputElement | HTMLTextAreaElement): Promise<void> {
    const query = inputEl.value.trim();
    if (!query || this.isProcessing) return;

    this.isProcessing = true;
    this.isThinking = true;
    this.errorMessage = null;
    this.shouldScroll = true;

    const userMessage: Message = { 
      sender: 'user', 
      text: query,
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    this.cdr.detectChanges();

    const aiMessage: Message = { 
      sender: 'ai', 
      text: '',
      sources: [],
      timestamp: new Date()
    };
    this.messages.push(aiMessage);
    const aiIdx = this.messages.length - 1;

    inputEl.value = '';

    try {
      await this.aiChatService.sendMessage(
        query,
        this.history,
        (token: string) => {
          this.messages[aiIdx].text += token;
          this.isProcessing = false;
          this.cdr.detectChanges();
          this.shouldScroll = true;
        },
        (sources: string[]) => {
          if (this.messages[aiIdx].sources) {
            this.messages[aiIdx].sources = sources;
            this.cdr.detectChanges();
          }
        }
      );

      this.history.push({
        query,
        response: this.messages[aiIdx].text,
        sources: this.messages[aiIdx].sources
      });

    } catch (err) {
      this.messages[aiIdx].text = 'Sorry, I encountered an error processing your request. Please try again.';
      this.errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Chat error:', err);
    } finally {
      this.isThinking = false;
      this.isProcessing = false;
      this.cdr.detectChanges();
      this.shouldScroll = true;
    }
  }

  async quickAsk(query: string): Promise<void> {
    const inputEl = document.querySelector('input[placeholder="Ask me anything..."]') as HTMLInputElement;
    if (inputEl) {
      inputEl.value = query;
      await this.sendMessage(inputEl);
    }
  }

  openSource(sourceName: string): void {
    console.log('Opening source:', sourceName);
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  private async loadChatHistory(): Promise<void> {
    const sessionId = localStorage.getItem('chatSessionId') || this.generateSessionId();
    localStorage.setItem('chatSessionId', sessionId);
    
    try {
      const response = await fetch(`/view/endpoint/chat/ai/history/${sessionId}`);
      if (response.ok) {
        this.messages = await response.json();
        this.shouldScroll = true;
      }
    } catch (err) {
      console.warn('Failed to load chat history:', err);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// // src/app/@pages/chat/chat.component.ts
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { AIChatService } from '../../services/ai-chat.service';

// interface Message { sender: 'user' | 'ai'; text: string; }

// @Component({
//   selector: 'app-chat',
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.scss']
// })
// export class ChatComponent implements OnInit, OnDestroy {
//   isProcessing: boolean = false;
//   errorMessage: string | null = null; 
//   // UI State Properties
//   isSidebarOpen: boolean = false;
//   isPaletteVisible: boolean = false;
//   showFeedbackModal: boolean = false;
//   userCorrection: string = '';
//   isChatOpen: boolean = false;
//   private tailwindLoaded = false;
//   private tailwindLoadingPromise?: Promise<void>;

  
//   // ==================== STATE ====================
//   messages: Message[] = [];
//   isThinking: boolean = false;
//   history: any[] = [];
  
//   // ==================== COMMAND PALETTE ====================
//   commands = [
//     { name: 'Ask AI', action: () => this.toggleAIAssistant() },
//     { name: 'Go to Home', action: () => this.showSection('home') },
//     { name: 'View Messages', action: () => this.showSection('messages') },
//     { name: 'Clear Notifications', action: () => this.showNotification('Cleared!', 'info') }
//   ];

//   constructor(private aiChatService: AIChatService) {
//     // Expose this instance globally for HTML onclick events
//     (window as any).component = this;
//   }

//   ngOnInit(): void {
//     this.setupKeyboardShortcuts();
//     this.loadChatHistory();
//   }

//   ngOnDestroy(): void {
//     // Cleanup listeners
//   }

//   toggleChat(): void {
//     this.isChatOpen = !this.isChatOpen;
//   }

//   closeChat(): void {
//     this.isChatOpen = false;
//   }

//   // ==================== CORE MESSAGING ====================
//   async sendMessage(inputEl: HTMLInputElement): Promise<void> {
//     const query = inputEl.value.trim();
//     if (!query) return;

//     this.isProcessing = true; 
//     this.isThinking = true;
//     this.messages.push({ sender: 'user', text: query });
//     inputEl.value = '';
    
//     this.messages.push({ sender: 'ai', text: '' });
//     const aiIdx = this.messages.length - 1;

//     try {
//       await this.aiChatService.sendMessage(
//         query,
//         this.history,
//         (token: string) => {
//           if (this.isProcessing) this.isProcessing = false;
//           this.messages[aiIdx].text += token;
//         },
//         (sources: string[]) => {
//           this.renderSources(sources);
//         }
//       );
//     } catch (err) {
//       this.messages[aiIdx].text = "Error: Unable to reach Vikki.";
//     } finally {
//       this.isThinking = false;
//       this.isProcessing = false;
//     }
//   }

//   // ==================== SOURCE CITATIONS & SIDEBAR ====================
//   renderSources(sources: string[]): void {
//     const c = document.getElementById('ai-messages');
//     if (!c || sources.length === 0) return;

//     const div = document.createElement('div');
//     div.className = 'mt-4 pt-2 border-t text-sm';
//     div.innerHTML = '<strong>References:</strong> ' + sources.map(source => 
//         `<button type="button" 
//                  onclick="window.component.openSource('${source}')" 
//                  class="ml-2 text-blue-600 hover:underline">
//            [${source.replace('.pdf', '').replace(/_/g, ' ')}]
//          </button>`
//     ).join(' | ');
    
//     c.appendChild(div);
//   }

//   openSource(sourceName: string): void {
//     const sidebar = document.getElementById('doc-sidebar');
//     const title = document.getElementById('doc-title');
//     const content = document.getElementById('doc-content');
    
//     if (sidebar && title && content) {
//       title.textContent = sourceName;
//       content.innerHTML = '<p>Loading document...</p>';
//       sidebar.classList.add('sidebar-open');
      
//       fetch(`/assets/docs/protected/${sourceName}`)
//         .then(res => res.ok ? res.text() : 'Document content not found.')
//         .then(text => content.textContent = text)
//         .catch(() => content.textContent = 'Could not load document.');
//     }
//   }

//   closeSidebar(): void {
//     document.getElementById('doc-sidebar')?.classList.remove('sidebar-open');
//   }

//   // ==================== COMMAND PALETTE LOGIC ====================
//   togglePalette(open: boolean): void {
//     const p = document.getElementById('cmd-palette');
//     if (open) {
//       p?.classList.remove('hidden');
//       setTimeout(() => document.getElementById('cmd-input')?.focus(), 100);
//       this.renderCommands(this.commands);
//     } else {
//       p?.classList.add('hidden');
//     }
//   }

//   closePalette(): void { this.togglePalette(false); }

//   filterCommands(val: string): void {
//     const filtered = this.commands.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
//     this.renderCommands(filtered);
//   }

//   renderCommands(cmds: any[]): void {
//     const list = document.getElementById('cmd-list');
//     if (!list) return;
//     list.innerHTML = cmds.map(c => `
//       <li class="p-2 hover:bg-gray-100 rounded cursor-pointer" onclick="component.executeCmd('${c.name}')">
//         ${c.name}
//       </li>
//     `).join('');
//   }

//   executeCmd(name: string): void {
//     const cmd = this.commands.find(c => c.name === name);
//     if (cmd) cmd.action();
//     this.closePalette();
//   }

//   // ==================== UTILS & STUBS ====================
//   private setupKeyboardShortcuts(): void {
//     document.addEventListener('keydown', (e: KeyboardEvent) => {
//       // Ctrl+K or Cmd+K
//       if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
//         e.preventDefault();
//         this.togglePalette(true);
//       }
//       if (e.key === 'Escape') {
//         this.closePalette();
//         this.closeSidebar();
//       }
//     });
//   }

//   showSection(section: string): void { 
//     console.log('Nav:', section); 
//   }

//   toggleAIAssistant(): void { 
//     console.log('Toggle AI'); 
//   }

//   showNotification(msg: string, type: string): void { 
//     console.log(type, msg); 
//   }

//   async submitFeedback(type: 'positive' | 'negative'): Promise<void> {
//     const lastQuery = this.messages[this.messages.length - 2]?.text;
//     const lastAnswer = this.messages[this.messages.length - 1]?.text;
//     let userCorrection = '';

//     if (type === 'negative') {
//       const correction = prompt("What would have been a better answer?");
//       if (correction) userCorrection = correction;
//     }

//     // Close modal after submission
//     this.showFeedbackModal = false;
//     this.userCorrection = ''; // Reset

//     fetch('/feedback', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ 
//         sessionId: localStorage.getItem('chatSessionId'),
//         type, 
//         lastQuery, 
//         lastAnswer, 
//         userCorrection,
//         timestamp: new Date() 
//       })
//     });
    
//     this.showNotification(`Thank you for your feedback!`, 'info');
//   }

//   // Fix 1: Handle Keydown (Shift+Enter for newline, Enter to send)
//   handleKeyDown(event: KeyboardEvent, inputEl: HTMLTextAreaElement): void {
//     if (event.key === 'Enter' && !event.shiftKey) {
//       event.preventDefault();
//       this.sendMessage(inputEl);
//     }
//   }

//   // Fix 1: Quick ask functionality
//   async quickAsk(query: string): Promise<void> {
//     const inputEl = document.querySelector('textarea');
//     if (inputEl) {
//       inputEl.value = query;
//       await this.sendMessage(inputEl);
//     }
//   }

//   async loadChatHistory(): Promise<void> {
//     const sessionId = localStorage.getItem('chatSessionId'); // Or generate/retrieve
//     try {
//       const response = await fetch(`/view/endpoint/chat/ai/history/${sessionId}`);
//       this.messages = await response.json();
//     } catch (err) {
//       console.error('Failed to load history');
//     }
//   }
// }