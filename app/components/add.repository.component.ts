import { Component } from "@angular/core";

@Component({
  selector: "add-repository-panel",
  template: `
    <div class="add-repository-panel" id="add-repository-panel">
      <img src="./assets/Back.svg" (click)="returnToMainPanel()" class="back-button">

      <div class="add-repository-body">
        <div class="code-body">
          <div class="title">
            <h1 class="clone-title">Clone from Internet</h1>
          </div>
          <div class="block">
            <div class="left">
              <p>URL to clone from</p>
            </div>
            <div class="right">
              <input type="text" oninput="updateLocalPath()" name="repositoryRemote" size="50" id="repoClone" placeholder="https://github.com/user/repository.git"/>
              <button type="button" class="button-clone" id="cloneButton" (click)="selectSave()">Clone</button>
            </div>
          </div>
        </div>

        <div class="block">
          <div class="left">
            <p>File location to save to</p>
          </div>
          <div class="right">
            <input type="text" name="repositoryLocal" size="50" id="repoSave"/>
            <button class="button-clone" (click)="selectSave()">Save</button>
			      <input type="file" id="dirPickerSaveNew" name="dirListSave" (change)="addRepository();" style="display: none;" webkitdirectory />
          </div>
        </div>

        <div id="open-local-repository" class="open-local-repository">
          <div class="title">
            <h1 class="open-local-repo">Open Local Repository</h1>
          </div>

          <div class="block">
            <div class="left">
              <p>Location of existing repository</p>
            </div>
            <div class="right">
              <input type="text" name="repositoryLocal" size="50" id="repoOpen"/>
              <button class="button-open" (click)="selectDirectory()">Open</button>
              <input type="file" id="dirPickerOpenLocal" name="dirList" (change)="openRepository()" style="display: none;" webkitdirectory />
            </div>
          </div>
        </div>

        <div id="create-local-repository">
          <div class="title">
            <h1>Create a local repository</h1>
          </div>

          <div class="block">
            <div class="left">
              <p>Location of folder</p>
            </div>

            <div class="right">
              <input type="text" name="folderLocal" size="50" id="repoCreate"/>
              <button class="button-open" (click)="selectLocalRepoDirectory()">Create</button>
              <input type="file" id="dirPickerCreateLocal" name="localDir" (change)="createLocalRepository()" style="display: none;" webkitdirectory />
            </div>

        </div>
      </div>
    </div>
  `
})

export class AddRepositoryComponent {

  addRepository(): void {
    downloadRepository();
    switchToMainPanel();
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

  //add function to parse the input for creating a local repository
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

  returnToMainPanel(): void {
    switchToMainPanel();
  }

  createLocalRepository(): void {
    createLocalRepository();
  }
}
