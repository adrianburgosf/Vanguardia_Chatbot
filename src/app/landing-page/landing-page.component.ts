import { Component, Renderer2, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule, NgClass, NgFor, NgIf],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LandingPageComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthService, private renderer: Renderer2) { }

  ngOnInit(): void {
    const menuToggle = document.querySelector('.menu-toggle') as HTMLElement | null;
    const navigation = document.querySelector('.navigation') as HTMLElement | null;
    const sendChatBtn = document.querySelector('.chat-input span') as HTMLElement | null;
    this.renderer.setStyle(document.body, 'background-color', 'lightblue');
    let userMessage;

    //NAVBAR------------------------------------------------------------------------

    if (menuToggle && navigation) {
      menuToggle.onclick = () => {
        navigation.classList.toggle('open');
      };
    }

    // Type assertion and null check for listItems
    const listItems = document.querySelectorAll('.list-item') as NodeListOf<HTMLElement>;
    listItems.forEach(item => {
      item.onclick = () => {
        // Remove the 'active' class from all items
        listItems.forEach(listItem => listItem.classList.remove('active'));
        // Add the 'active' class to the clicked item
        item.classList.add('active');
      };
    });

    //-------------------------------------------------------------------------------

    //Chatbotwindow------------------------------------------------------------------

    const createChatLi = (message: string, className: string): HTMLElement => {
      // Create a chat <li> element with passed message and className
      const chatLi = document.createElement('li');
      console.log(message);
      console.log(className);
      chatLi.classList.add("chat", className);
      let chatContent = className === "outgoing" ? `<p>${message}</p>` : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
      chatLi.innerHTML = chatContent;
      return chatLi;
    };

    const handleChat = (): void => {
      const chatInput = document.querySelector('.chat-input textarea') as HTMLTextAreaElement | null;
      const chatbox = document.querySelector('.chatbox');

      if (chatInput && chatbox) {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatInput.value = '';
        setTimeout(() => {
          chatbox.appendChild(createChatLi("Thinking...", "incoming"));
        }, 600);
      }
    };
    sendChatBtn?.addEventListener("click", handleChat);

    //-------------------------------------------------------------------------------
  }
  ngOnDestroy(): void {
    this.renderer.removeStyle(document.body, 'background-color');
  }

  // Call logout method from AuthService
  logout() {
    this.authService.logout();
  }
}
