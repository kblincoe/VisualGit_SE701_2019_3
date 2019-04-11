import { Component, OnInit, } from "@angular/core";

@Component({
  selector: "user-auth",
  templateUrl: 'app/components/authenticate/authenticate.component.html'
})

export class AuthenticateComponent implements OnInit {
  ngOnInit(): any {
    // useSavedCredentials returns true if there is a saved credential and uses it.
    if (useSavedCredentials()){
      // @ts-ignore
      document.getElementById("rememberLogin").checked = true;
    } else {
      // @ts-ignore
      document.getElementById("rememberLogin").checked = false;
    }
  }

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
