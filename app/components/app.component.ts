import { Component } from "@angular/core";
import { HeaderComponent } from "./header.component";
import { FilePanelComponent } from "./file.panel.component";
import { BodyPanelComponent } from "./body.panel.component";
import { FooterComponent } from "./footer.component";
import { AddRepositoryComponent } from "./add.repository.component";
import { AuthenticateComponent } from "./authenticate.component"

@Component({
  selector: "my-app",
  template: `
    <user-auth></user-auth>
    <app-header></app-header>
    <file-panel></file-panel>
    <body-panel></body-panel>
    <add-repository-panel></add-repository-panel>
    <app-footer></app-footer>
  `,
  directives: [HeaderComponent, FilePanelComponent, BodyPanelComponent, FooterComponent, AddRepositoryComponent, AuthenticateComponent]
})

export class AppComponent {
  ngOnInit(): void {
    const userColorFilePath = ".settings/user_color.txt";

    // If user has previously saved a color, then set the app to that color
    if (fs.existsSync(userColorFilePath)) {
      fs.readFile(userColorFilePath, function(err, buffer) {
        console.log(buffer.toString());
        let color = buffer.toString();
        changeColor(color);
      });
    }
  }
}
