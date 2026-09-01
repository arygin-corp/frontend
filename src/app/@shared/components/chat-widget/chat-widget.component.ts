import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss']
})
export class ChatWidgetComponent {
  isOpen = false;

  toggleChat() {
    this.isOpen = !this.isOpen;
  }
}