import { Component } from "@angular/core";
import { FooterComponent } from "../footer/footer.component";
import { TextEditorComponent } from "../textEditor/text.editor.component";

@Component({
  selector: "diff-panel",
  templateUrl: 'app/components/diffPanel/diff.panel.component.html'
})

export class DiffPanelComponent {
  private footerInstance: FooterComponent = new FooterComponent();
  private textEditorInstance: TextEditorComponent = new TextEditorComponent();

  openFromDiff(): void {
    let doc = document.getElementById("diff-panel");
    this.footerInstance.displayFileEditor();
    console.log(doc.getElementsByTagName("P")[0].innerHTML);
  }
}
