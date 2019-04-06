import { Component } from "@angular/core";


@Component({
  selector: "user-auth",
  templateUrl: 'app/components/authenticate/authenticate.component.html'
})

export class AuthenticateComponent {
  switchToMainPanel(): void {
    getUserInfo(switchToAddRepositoryPanel);
  }

  createNewAccount(): void {
    window.open("https://github.com/join?", "_blank");
  }
  
  openGitHubPasswordResetPage() : void {
    window.open("https://github.com/password_reset", "_blank");

  }
}
