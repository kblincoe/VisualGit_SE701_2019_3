import { Component } from "@angular/core";

@Component({
  selector: "editor-panel",
  template: `
  <div class="editor-panel">
    <div class="editor-header">
      <button class="open-button" (click)="openFile()">Open File</button>
      <input type="file" id="file-upload" (change)="newFileUpload()" style="display: none;"/>
      <button class="open-button" (click)="saveFile()" id="save-button">Save</button>
      <div class="indent-selector">
        <p> Spaces to indent: </p>
        <select id="selected-indent" (change)="updateIndentAmount()">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4" selected="selected">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
        </select>
      </div>
      <button class="close-button" (click)="closeEditor()">Close</button>
    </div>
    <div class="file-tab" id="file-tab">
    </div>
    <div id="0" class="tabcontent">
      <div class="editor-area">
        <textarea class="lines" readonly="true" id="line-text-area"></textarea>
        <textarea class="file" id="file-text-area" (click)="createLineNumbers()" (scroll)="scrollSync()" (keydown)="keyPressed($event)" (input)="valueChanged()" (cut)="cutPastePressed = true" (paste)="cutPastePressed = true"></textarea>
      </div>
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
  changingLines: boolean;

  // Amount of spaces to be added on 'Tab' press.
  numberOfSpacesToIndent = 4;

  // Path of opened file
  filePath: string;

  // Stores the id of the currently open file tab.
  currentFileId = 0;

  // This function is used to open files.
  openFile(): void {
    // Get the upload input element and then click it.
    let fileOpenInput = document.getElementById("file-upload");
    if (fileOpenInput != null) {
      fileOpenInput.click();
    }
  }

  /*
    This function is called when a file is uploaded.
    It's purpose is to create a tab for the new file
    and fill the file text area with the file contents.
  */
  newFileUpload(): void {
    let reader = new FileReader();

    // The input where the opened file is located.
    let fileOpenInput = document.getElementById("file-upload");

    if (fileOpenInput != null) {
      let files = (<HTMLInputElement>fileOpenInput).files!

      if (files != null) {
        // This runs when the reader has finished reading the file.
        reader.onload = (e) => {
          let fileTextArea = document.getElementById("file-text-area");
          if (fileTextArea != null && reader.result != null) {
            // Add the file text to the editor and create lines.
            (<HTMLInputElement>fileTextArea).value = (<string>reader.result);
            this.createLineNumbers();
            let file = files[0];
            this.filePath = file.path
            this.createFileTab(file.name);
          }
        }

        // Start reading the uploaded file.
        reader.readAsText(files[0]);
      }
    }
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
  switchTab(fileTabId: string, fileId: string): void {
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
      let selectedTab = document.getElementById(fileTabId)!;
      selectedTab.className += " active";
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
  createLineNumbers(): void {
    // If this function is already running, return.
    if (this.changingLines) {
      return;
    }

    // The function has started running.
    this.changingLines = true;

    let i = 0;
    let lineNumberString = ''
    let lineTextArea = document.getElementById("line-text-area");
    let fileTextArea = document.getElementById("file-text-area");

    /*
      If the elements were found, create a string of numbers
      corresponding to the number of lines in the editor.
    */
    if (lineTextArea != null && fileTextArea != null) {
      let fileText = (<HTMLInputElement>fileTextArea).value
      let numberOfLineBreaks = (fileText.match(/\n/g) || []).length;
      for (i = 0; i < numberOfLineBreaks + 1; i++) {
        lineNumberString = lineNumberString + (i + '\r\n');
      }
      (<HTMLInputElement>lineTextArea).value = lineNumberString;
    }

    // The function has finished running.
    this.changingLines = false;
  }

  /*
    Store the last key pressed. Required to decide when 
    to repopulate the line numbers.
  */
  keyPressed(event: KeyboardEvent): void {
    this.currentKey = <string>event.key;

    /*
      When tab is pressed, override default behaviour and
      insert specified number of spaces instead.
    */
    if (event.key == "Tab") {
      event.preventDefault();
      let fileTextArea = <HTMLInputElement>document.getElementById("file-text-area");

      // Current cursor location.
      let selectionStart = fileTextArea.selectionStart;

      // Cursor location after current edit.
      let selectionEnd = fileTextArea.selectionEnd;
      if (selectionStart != null && selectionEnd != null) {
        // Everything before the cursor + amount of spaces + everything after cursor end point.
        fileTextArea.value = fileTextArea.value.substring(0, selectionStart) + " ".repeat(this.numberOfSpacesToIndent) + fileTextArea.value.substring(selectionEnd);

        // Move cursor forward by amount of spaces added.
        fileTextArea.selectionStart = fileTextArea.selectionEnd = selectionStart + this.numberOfSpacesToIndent;
      }
    } else if (event.ctrlKey || event.metaKey) {
      // When Ctrl+S is pressed, save file.
      if (event.key == "s") {
        event.preventDefault();
        this.saveFile();
      }
    }
  }

  /*
    This function is called whenever there is a change in
    the file text area. It repopulates the line numbers 
    depending on what action the user takes.
  */
  valueChanged(): void {
    if (this.currentKey == "Enter" || this.currentKey == "Backspace" || this.currentKey == "Delete" || this.cutPastePressed) {
      this.createLineNumbers();
      this.cutPastePressed = false;
    }
    // Change save button back to 'Save' on value change.
    let saveButton = document.getElementById("save-button");
    if (saveButton != null) {
      saveButton.innerHTML = "Save";
    }
  }

  /*
    Update the number of spaces to indent based 
    on selection.
  */
  updateIndentAmount(): void {
    let selector = <HTMLInputElement>document.getElementById("selected-indent");
    this.numberOfSpacesToIndent = parseInt(selector.value);
  }

  /*
    Get content of text area and file name and 
    save the contents.
  */
  saveFile(): void {
    let saveButton = document.getElementById("save-button");

    // Give user feedback that save is occuring.
    if (saveButton != null) {
      saveButton.innerHTML = "Saving...";
    }

    // Get current content.
    let fileTextArea = <HTMLInputElement>document.getElementById("file-text-area")

    // Save file.
    saveEditedFile(this.filePath, fileTextArea.value, this.saveSuccess)
  }

  /*
    This function gives user feedback after attempting to
    save the file.
  */
  saveSuccess(err: any): void {
    if (err) {
      // Inform user of error.
      displayModal("An error occured when saving, please try again.");
      console.log(err);
    } else {
      // Change save button to saved, remove star next to filename
      let saveButton = document.getElementById("save-button");
      if (saveButton != null) {
        saveButton.innerHTML = "Saved";
      }
    }
  }

  /*
    Creates a tab for the newly opened file and focuses
    the editor on this tab.
  */
  createFileTab(fileName: string): void {
    // Get div where tags are stored.
    let tabs = document.getElementById("file-tab")!;

    // Create new tab.
    let newTab = document.createElement("button");
    newTab.className = "tablinks";
    newTab.id = "tab-link-" + this.currentFileId;
    newTab.innerHTML = fileName;

    // Store function to be called when the tab is clicked.
    newTab.onclick = (e) => {
      this.switchTab("tab-link-" + this.currentFileId, "" + this.currentFileId);
    };

    // Add tab to the tab div.
    tabs.appendChild(newTab);

    // Focus on the new tab.
    this.switchTab("tab-link-" + this.currentFileId, "" + this.currentFileId);
  }
}
