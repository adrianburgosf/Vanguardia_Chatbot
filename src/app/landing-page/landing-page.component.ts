import { Component, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule, NgClass, NgFor, NgIf],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  userMessage: string = '';
  messages: { content: string, class: string }[] = [];

  constructor(private authService: AuthService, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.renderer.setStyle(document.body, 'background-color', 'lightblue');
  }
  ngOnDestroy(): void {
    this.renderer.removeStyle(document.body, 'background-color');
  }

  // Function to create a chat object for each message
  createChatMessage(message: string, className: string) {
    return { content: message, class: className };
  }

  // Function that sends the user's message
  sendMessage(): void {
    if (!this.userMessage.trim()) {
      return;  // Do nothing if the message is empty or just whitespace
    }

    // Append the user's message to the chatbox
    this.messages.push(this.createChatMessage(this.userMessage, 'outgoing'));

    // Clear the input after the message is sent
    this.userMessage = '';

    // Simulate bot's response after a short delay
    setTimeout(() => {
      this.messages.push(this.createChatMessage('Thinking...', 'incoming'));
    }, 600);
  }

  // Call logout method from AuthService
  logout() {
    this.authService.logout();
  }
}
