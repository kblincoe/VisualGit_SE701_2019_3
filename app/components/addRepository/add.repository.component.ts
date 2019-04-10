import { Component } from "@angular/core";

@Component({
  selector: "add-repository-panel",
  templateUrl: 'app/components/addRepository/add.repository.component.html'
})

export class AddRepositoryComponent {


  selectClone(): void {
    if (document.getElementById("repoClone").value == null || document.getElementById("repoClone").value == "") {
      window.alert("Please enter the URL of the repository you wish to clone");
    } else if (document.getElementById("repoSave").value == null || document.getElementById("repoSave").value == "") {
      updateLocalPath();
    
    } else {
      // If directory is specified, continue as normal
      this.addRepository();
    }
  }

  // this function opens the browse folder window, which lets the user select a folder location
  selectBrowse(): void {
    document.getElementById("dirPickerSaveNew").click();
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

  addRepository(): void {
    downloadRepository();
  }

  openRepository(): void {
    openRepository();
    switchToMainPanel();
  }

  chooseLocalPath(): void {
    chooseLocalPath();
  }

  createLocalRepository(): void {
    createLocalRepository();
  }

  returnToMainPanel(): void {
    switchToMainPanel();
  }
}
