import { Component } from "@angular/core";
import { RepositoryService } from "../../services/repository.service";
import { GraphService } from "../../services/graph.service";


@Component({
  selector: "app-header",
  templateUrl: 'app/components/header/header.component.html',
  providers: [RepositoryService, GraphService]
})

export class HeaderComponent   {
  repoName: string = "Repo name";
  repoBranch: string = "Repo branch";
  repository: any;

  promptUserToAddRepository(): void {
    switchToAddRepositoryPanel();
  }

  switchToMainPanel(): void {
    signInHead(collapseSignPanel);
    document.getElementById("Email1").value = "";
    document.getElementById("Password1").value = "";
  }

  WarningSignIn(): void {
    redirectToHomePage();
  }

}
