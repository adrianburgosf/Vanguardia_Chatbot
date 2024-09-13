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
    const sidebar = document.querySelector('.sidebar') as HTMLElement | null;
    this.renderer.setStyle(document.body, 'background-color', 'lightblue');
    let userMessage;

    //NAVBAR------------------------------------------------------------------------

    menuItems.forEach(menuItem => {
      this.renderer.listen(menuItem, 'click', () => {
        // Remove 'active' class from all other menu items
        menuItems.forEach(item => {
          if (item !== menuItem) {
            item.classList.remove('active');
            const subMenu = item.querySelector('ul');
            if (subMenu) {
              subMenu.classList.remove('open');
            }
          }
        });

        // Toggle the active class on the clicked item
        menuItem.classList.toggle('active');

        // Find submenu and toggle its visibility
        const parentLi = menuItem.parentElement;
        const subMenu = parentLi?.querySelector('.sub-menu') as HTMLElement;
        if (subMenu) {
          this.renderer.listen(menuItem, 'click', (event) => {
            event.preventDefault();

            // Toggle 'active' class on parent li
            parentLi?.classList.toggle('active');

            // Toggle visibility of the submenu
            if (subMenu.style.display === 'block') {
              subMenu.style.display = 'none';
            } else {
              subMenu.style.display = 'block';
            }
          });
        }
      });
    });

    // Sidebar toggle functionality
    if (sidebarToggle && sidebar) {
      this.renderer.listen(sidebarToggle, 'click', () => {
        sidebar.classList.toggle('active');
      });
    }



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
