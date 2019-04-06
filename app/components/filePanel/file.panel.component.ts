import { Component } from "@angular/core";

@Component({
  selector: "file-panel",
  templateUrl: 'app/components/filePanel/file.panel.component.html'
})

export class FilePanelComponent {
  displayFileEditor(): void {
    let editor = document.getElementById("editor-panel");

    if (editor != null) {
      editor.style.height = "100vh"
      editor.style.width = "100vw"
      editor.style.zIndex = "10";
    }
  }
}
