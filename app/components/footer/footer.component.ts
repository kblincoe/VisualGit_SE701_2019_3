import { Component } from "@angular/core";

@Component({
  selector: "app-footer",
  templateUrl: 'app/components/footer/footer.component.html'
})

export class FooterComponent {
  displayFileEditor(): void {
    let editor = document.getElementById("editor-panel");

    if (editor != null) {
      editor.style.height = "100vh"
      editor.style.width = "100vw"
      editor.style.zIndex = "10";
    }
  }
}
