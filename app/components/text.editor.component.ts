import { Component } from "@angular/core";

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
      <div class="editor-area">
        <textarea class="lines" readonly="true" id="line-text-area"></textarea>
        <textarea class="file" id="file-text-area" (click)="populate()" (scroll)="scrollSync()" (keydown)="keyPressed($event)" (input)="valueChanged()" (cut)="cutPastePressed = true" (paste)="cutPastePressed = true"></textarea>
      </div>
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
  // Stores the last key pressed by the user.
  currentKey: string;

  // True when the last change was cut or paste. 
  cutPastePressed = false;

  // True when the line text area is being populated.
  populating: boolean;

  // This function is used to open files.
  openFile(): void {

  }

  /* 
    This function is used to close the editor and return
    to the main screen.
  */
  closeEditor(): void {

  }

  /*
    This function is used to switch between different file tabs
  */
  switchTab(event: Event, fileId: string): void {
    // Declare all variables
    let i = 0;
    let tabcontent: HTMLCollectionOf<Element>;
    let tablinks: HTMLCollectionOf<Element>;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      (<HTMLElement>tabcontent[i]).style.display = "none";
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
    if (fileIdElement != null) {
      fileIdElement.style.display = "block";
      if (event.currentTarget != null) {
        (<HTMLElement>event.currentTarget).className += " active";
      }
    }
  }

  /*
    This function helps to synchronise scrolling between
    the editor text area and the line counter text area.
  */
  scrollSync(): void {
    let lineTextArea = document.getElementById("line-text-area");
    let fileTextArea = document.getElementById("file-text-area");
    if (lineTextArea != null && fileTextArea != null) {
      lineTextArea.scrollTop = fileTextArea.scrollTop;
    }
  }

  /*
    This function fills the line text area with the appropriate
    line numbers.
  */
  populate(): void {
    // If this function is already running, return.
    if (this.populating) {
      return;
    }


    // The function has started running.
    this.populating = true;
    
    let i = 0;
    let lineNumberString = ''
    let lineTextArea = document.getElementById("line-text-area");
    let fileTextArea = document.getElementById("file-text-area");

    /*
      If the elements were found, create a string of numbers
      corresponding to the number of lines in the editor.
    */
    if (lineTextArea != null && fileTextArea != null) {
      let fileText = (<HTMLInputElement> fileTextArea).value
      let numberOfLineBreaks = (fileText.match(/\n/g) || []).length;
      for (i = 0; i < numberOfLineBreaks + 1; i++) {
        lineNumberString = lineNumberString + (i + '\r\n');
      }
      (<HTMLInputElement>lineTextArea).value = lineNumberString;
    }

    // The function has finished running.
    this.populating = false;
  }

  /*
    Store the last key pressed. Required to decide when 
    to repopulate the line numbers.
  */
  keyPressed(event: KeyboardEvent): void {
    this.currentKey = (<string> event.key);
  }

  /*
    This function is called whenever there is a change in
    the file text area. It repopulates the line numbers 
    depending on what action the user takes.
  */
  valueChanged(): void {
    if (this.currentKey == "Enter" || this.currentKey == "Backspace" || this.currentKey == "Delete" || this.cutPastePressed){
      this.populate();
      this.cutPastePressed = false;
    }
  }
}
