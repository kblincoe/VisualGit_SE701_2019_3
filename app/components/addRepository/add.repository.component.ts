import { Component } from "@angular/core";

@Component({
  selector: "add-repository-panel",
  templateUrl: 'app/components/addRepository/add.repository.component.html'
})

export class AddRepositoryComponent {

  addRepository(): void {
    downloadRepository();
  }

  //Add function that determines if directory written or not
  selectSave(): void {
    if (document.getElementById("repoSave").value == null || document.getElementById("repoSave").value == "") {
      // If no directory specified, launch file browser
      document.getElementById("dirPickerSaveNew").click();
    } else {
      // If directory is specified, continue as normal
      this.addRepository();
    }
  }

  //Add function that determines if directory written or not
  selectDirectory(): void {
    if (document.getElementById("repoOpen").value == null || document.getElementById("repoOpen").value == "") {
      // If no directory specified, launch file browser
      document.getElementById("dirPickerOpenLocal").click();
    } else {
      // If directory is specified, continue as normal
      this.openRepository();
    }
  }

  selectLocalRepoDirectory(): void{
    if (document.getElementById("repoCreate").value == null || document.getElementById("repoCreate").value == ""){
      document.getElementById("dirPickerCreateLocal").click();
    }else {
      this.createLocalRepository();
    }
  }

  openRepository(): void {
    openRepository();
    switchToMainPanel();
  }

  createLocalRepository(): void {
    createLocalRepository();
  }

  returnToMainPanel(): void {
    switchToMainPanel();
  }
}
