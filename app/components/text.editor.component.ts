import { Component, Input } from "@angular/core";

@Component({
  selector: "editor-panel",
  template: `
  <div class="editor-panel">
    <div>
      <button class="open-button" (click)="openFile()">Open File</button>
      <button class="close-button" (click)="closeEditor()">Close</button>
    </div>
    <div class="file-tab" id="file-tab">
      <button class="tablinks" (click)="switchTab($event, '0')">Some File</button>
      <button class="tablinks" (click)="switchTab($event, '1')">Some Other File</button>
    </div>
    <div id="0" class="tabcontent">
      <h3>File A</h3>
      <p>Contents</p>
    </div>

    <div id="1" class="tabcontent">
      <h3>File B</h3>
      <p>Content</p> 
    </div>
  </div>
  `
})

/**
 * This component contains the HTML and functionality
 * of the text editor.
 */
export class TextEditorComponent {
  // This function is used to open files.
  openFile(){

  }

  /* 
    This function is used to close the editor and return
    to the main screen.
  */
  closeEditor(){

  }

  /*
    This function is used to switch between different file tabs
  */
  switchTab(event: Event, fileId: string) {
    // Declare all variables
    let i = 0;
    let tabcontent: HTMLCollectionOf<Element>;
    let tablinks: HTMLCollectionOf<Element>;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      (<HTMLElement> tabcontent[i]).style.display = "none";
    }
  
    /*
      Get all elements with class="tablinks", containing file text
      and remove the class "active".
    */
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    /*
      Show the clicked file tab, and add an "active" class to the 
      button that opened the tab
    */
    let fileIdElement = document.getElementById(fileId);
    if (fileIdElement != null){
      fileIdElement.style.display = "block";
      if (event.currentTarget != null){
        (<HTMLElement> event.currentTarget).className += " active";
      }
    }
  }
}
