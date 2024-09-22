declare var enrollNewUser: any;

import { Component, Renderer2, OnInit, OnDestroy, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule, NgClass, NgFor, NgIf],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingPageComponent implements OnInit, OnDestroy {

  email: string = '';
  userName: string = '';
  profilePicture: string = '';
  authMethod: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  updateError: string = '';

  constructor(private authService: AuthService, private renderer: Renderer2, private router: Router, private http: HttpClient,) { }

  resetChat() {
    this.clearBrowserStorage();
    const chatbotContainer = document.getElementById('chatbot-container');
    if (chatbotContainer) {
      // Temporarily remove the content
      chatbotContainer.innerHTML = '';

      // Rebuild the df-messenger component
      chatbotContainer.innerHTML = `
        <df-messenger project-id="winged-helper-434722-f5" agent-id="bff06150-ba37-4fda-8b18-afaa13215397"
            language-code="en" max-query-length="-1">
            <df-messenger-chat chat-title="Chatbot Vanguardia">
            </df-messenger-chat>
        </df-messenger>
      `;

      const dfMessenger = chatbotContainer.querySelector('df-messenger');
      if (dfMessenger) {
        dfMessenger.addEventListener('df-user-input-entered', (event: any) => {
          const userMessage = event.detail.input;
          //this.saveMessage('User', userMessage);
          console.log(userMessage);
        });

        // Listen for bot responses
        dfMessenger.addEventListener('df-response-received', (event: any) => {
          const botResponse = event.detail?.data?.messages?.[0]?.text;
          //this.saveMessage('Bot', botResponse);
          console.log(botResponse);
        });
      }
    }
  }

  saveMessage(sender: string, message: string) {
    const chatHistory = localStorage.getItem('chatHistory');
    const parsedHistory = chatHistory ? JSON.parse(chatHistory) : [];
    parsedHistory.push({ sender, message });
    localStorage.setItem('chatHistory', JSON.stringify(parsedHistory));
  }

  clearBrowserStorage() {
    sessionStorage.clear();  // Clear the session storage for a fresh chat
  }


  ngOnInit(): void {
    this.resetChat();
    const sendChatBtn = document.querySelector('.chat-input span') as HTMLElement | null;
    const menuItems = document.querySelectorAll('.menu > ul > li') as NodeListOf<HTMLElement>;
    const sidebarToggle = document.querySelector('.menu-btn') as HTMLElement | null;
    const sidebarToggle2 = document.querySelector('.menu-btn2') as HTMLElement | null;
    const sidebar = document.querySelector('.sidebar') as HTMLElement | null;
    const chatInput = document.querySelector('.chat-input textarea') as HTMLTextAreaElement | null;
    const chatbox = document.querySelector('.chatbox');
    const nuevoChatBtn = document.getElementById('nuevo-chat-btn');
    const inputInitHeight = chatInput?.scrollHeight;
    this.renderer.setStyle(document.body, 'background-color', 'lightblue');
    let userMessage;

    const user = this.authService.getUserData();
    if (user) {
      this.authMethod = user.authMethod;
      this.email = user.email;
      this.userName = user.name; // Set the user's name
      this.profilePicture = user.profilePicture || 'https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small_2x/user-profile-icon-free-vector.jpg'; // Use a default image if none exists
    }

    //NAVBAR------------------------------------------------------------------------

    menuItems.forEach(menuItem => {
      if (menuItem.contains(nuevoChatBtn)) {
        return; // Skip the menuItem logic for Nuevo chat
      }
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

    const captureChatMessages = (): any[] => {
      const chatbox = document.querySelector('.chatbox') as HTMLElement | null;
      const messages: any[] = [];

      // Get all chat message elements (li elements)
      if (chatbox) {
        const chatItems = chatbox.querySelectorAll('li');

        chatItems.forEach(chatItem => {
          const messageType = chatItem.classList.contains('outgoing') ? 'outgoing' : 'incoming';
          const messageText = chatItem.querySelector('p')?.textContent?.trim() || '';
          if (messageText) {
            messages.push({ type: messageType, message: messageText });
          }
        });
      }
      if (messages.length <= 1) {
        return []; // Return an empty array if only one message is present
      }
      return messages;
    };

    if (nuevoChatBtn && chatbox) {
      this.renderer.listen(nuevoChatBtn, 'click', (event: Event) => {
        event.preventDefault(); // Prevent default action of the anchor tag
        nuevoChatBtn.classList.remove('active');


        const capturedMessages = captureChatMessages();
        if (capturedMessages.length > 0) {
          console.log(capturedMessages);
        }
        // Clear all chat messages
        chatbox.innerHTML = '';

        // Add the default message back
        const defaultMessage = `
          <li class="chat incoming">
            <span class="material-symbols-outlined">smart_toy</span>
            <p>Hi there 👋 <br> How can I help you today?</p>
          </li>
        `;
        chatbox.innerHTML = defaultMessage;
      });
    }

    //-------------------------------------------------------------------------------
  }
  ngOnDestroy(): void {
    this.renderer.removeStyle(document.body, 'background-color');
  }

  openPasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  // Close the password update modal
  closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Handle the password update submission
  updatePassword() {

    if (this.newPassword !== this.confirmPassword) {
      this.updateError = 'New password and confirmation password do not match';
      return;
    }

    const passwordUpdateData = {
      newPassword: this.newPassword
    };
    // Make the API call to update the password
    this.http.post('http://localhost:3000/user/update-password', passwordUpdateData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('loginToken')}`  // Include the JWT token in the headers
      }
    }).subscribe(
      (response: any) => {
        console.log('Password updated successfully:', response);
        this.closePasswordModal();  // Close the modal on success
        this.openSuccessModal();
      },
      (error) => {
        console.error('Error updating password:', error);
        this.updateError = 'Failed to update password. Please try again later.';
      }
    );
  }

  openSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
      modal.style.display = 'block';  // Show the success modal
      document.body.classList.add('modal-active');  // Disable clicks on the rest of the page
    }
  }

  // Close the success modal when the user clicks "OK"
  closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
      modal.style.display = 'none';  // Hide the success modal
      document.body.classList.remove('modal-active');  // Re-enable clicks on the page
    }
  }

  openDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
      modal.style.display = 'block';  // Show the modal
      document.body.classList.add('modal-active');  // Disable interactions with the rest of the page
    }
  }

  closeDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
      modal.style.display = 'none';  // Hide the modal
      document.body.classList.remove('modal-active');  // Re-enable interactions with the rest of the page
    }
  }

  confirmDeleteAccount() {
    // Close the modal
    this.closeDeleteAccountModal();

    // Call the function to delete the account
    this.deleteAccount();
  }

  openModal() {
    const modal = document.getElementById('updateFaceIdModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  // Close the modal if the user clicks "Cancel"
  closeModal() {
    const modal = document.getElementById('updateFaceIdModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Proceed with updating the FaceID if the user clicks "OK"
  proceedWithUpdate() {
    // Close the modal
    this.closeModal();
    this.deleteFaceID();
    this.updateFaceID(this.email, this.userName);
  }

  deleteAccount(): void {
    this.http.post('http://localhost:3000/user/delete', { email: this.email }).subscribe(
      (response: any) => {
        console.log('User account deleted:', response);
        // Navigate or perform any cleanup if needed
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      (error: any) => {
        console.error('Error deleting account:', error);
      }
    );

  }

  deleteFaceID(): void {
    const user2 = this.authService.getUserData();
    console.log(user2);
    if (user2.facialId) {
      this.http.delete(`http://localhost:3000/user/deletefacialid/${user2.facialId}`).subscribe(
        (response: any) => {
          console.log('Facial ID deleted:', response);
        },
        (error: any) => {
          console.error('Error deleting facial ID:', error);
        }
      );
    }
  }

  updateFaceID(email: string, name: string,): void {
    enrollNewUser(email, name,
      (facialId: string) => {
        console.log(facialId);

        this.http.post('http://localhost:3000/user/updateFacialId', { email, facialId })
          .subscribe(
            response => {
              console.log('FaceID enrollment successful:', response);
              this.router.navigate(['/landing-page']);
            },
            (error) => {
              console.log(error);
              alert('An error occurred while postiong facialID.');
              this.router.navigate(['/landing-page']);
            }
          );
      },
      (errCode: any) => {
        console.log(errCode);
        alert('Facial enrollment failed. You can add FaceID again later.');
        this.router.navigate(['/landing-page']);
      }
    );
  }

  // Call logout method from AuthService
  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }
}
