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
    let fileName = doc.getElementsByTagName("P")[0].innerHTML;
    let fileLocation = repoFullPath + '/' + fileName;

    if (readFile.exists(fileLocation)) {
      let readme = fs.readFileSync(fileLocation, 'utf8');
      console.log(readme);
      this.textEditorInstance.openDiffFile(fileName, fileLocation, readme);
    }
  }
}
