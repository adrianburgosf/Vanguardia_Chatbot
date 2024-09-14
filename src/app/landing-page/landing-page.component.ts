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
    const sendChatBtn = document.querySelector('.chat-input span') as HTMLElement | null;
    const menuItems = document.querySelectorAll('.menu > ul > li') as NodeListOf<HTMLElement>;
    const sidebarToggle = document.querySelector('.menu-btn') as HTMLElement | null;
    const sidebarToggle2 = document.querySelector('.menu-btn2') as HTMLElement | null;
    const sidebar = document.querySelector('.sidebar') as HTMLElement | null;
    const chatInput = document.querySelector('.chat-input textarea') as HTMLTextAreaElement | null;
    const inputInitHeight = chatInput?.scrollHeight;
    this.renderer.setStyle(document.body, 'background-color', 'lightblue');
    let userMessage;

    //NAVBAR------------------------------------------------------------------------

    menuItems.forEach(menuItem => {
      this.renderer.listen(menuItem, 'click', (event) => {
        event.preventDefault(); // Prevent default link behavior

        // Toggle the active class on the clicked item
        menuItem.classList.toggle('active');
        // Remove 'active' and close other submenus
        menuItems.forEach(item => {
          if (item !== menuItem) {
            item.classList.remove('active');
            const subMenu = item.querySelector('.sub-menu') as HTMLElement;
            if (subMenu) {
              subMenu.style.display = 'none';
            }
          }
        });

        // Toggle visibility of the submenu
        const subMenu = menuItem.querySelector('.sub-menu') as HTMLElement;
        if (subMenu) {
          subMenu.style.display = subMenu.style.display === 'block' ? 'none' : 'block';
        }
      });
    });

    // Sidebar toggle functionality
    if (sidebarToggle && sidebar) {
      this.renderer.listen(sidebarToggle, 'click', () => {
        sidebar.classList.toggle('active');
      });
    }
    if (sidebarToggle2 && sidebar) {
      this.renderer.listen(sidebarToggle2, 'click', () => {
        sidebar.classList.toggle('active');
      });
    }



    //-------------------------------------------------------------------------------

    //Chatbotwindow------------------------------------------------------------------

    const createChatLi = (message: string, className: string): HTMLElement => {
      // Create a chat <li> element with passed message and className
      const chatLi = document.createElement('li');
      chatLi.classList.add("chat", className);
      let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
      chatLi.innerHTML = chatContent;
      const paragraph = chatLi.querySelector("p");
      if (paragraph) {
        paragraph.textContent = message;
      }
      return chatLi;
    };

    const handleChat = (): void => {
      const chatbox = document.querySelector('.chatbox');
      if (chatInput && chatbox) {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);
        chatInput.value = '';

        setTimeout(() => {
          chatbox.appendChild(createChatLi("Thinking...", "incoming"));
          chatbox.scrollTo(0, chatbox.scrollHeight);
        }, 600);
      }
    };
    chatInput?.addEventListener("input", () => {
      chatInput.style.height = `${inputInitHeight}px`;
      chatInput.style.height = `${chatInput.scrollHeight}px`;
    });
    sendChatBtn?.addEventListener("click", handleChat);

    chatInput?.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) { // Enter key without Shift (to avoid newline)
        event.preventDefault(); // Prevent default action of Enter (like new line)
        handleChat();
      }
    });

    //-------------------------------------------------------------------------------
  }
  ngOnDestroy(): void {
    this.renderer.removeStyle(document.body, 'background-color');
  }

  // Call logout method from AuthService
  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }
}
