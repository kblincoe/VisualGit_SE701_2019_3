import { Component } from "@angular/core";

@Component({
  selector: "pull-request-panel",
  templateUrl: "app/components/pullRequestPanel/pull.request.panel.component.html"
})

/**
 * This component contains the functionality
 * of the pull request panel.
 */
export class PullRequestPanelComponent {
  isShowingPRPanel = false;

  togglePRPanel(): void {
    let prPanel = document.getElementById("pull-request-panel");
    let bodyPanel = document.getElementById("body-panel");
    if (prPanel != null && bodyPanel != null) {
      this.isShowingPRPanel ? this.hidePRPanel(prPanel, bodyPanel) : this.showPRPanel(prPanel, bodyPanel);
    }
  }

  showPRPanel(prPanel: HTMLElement, bodyPanel: HTMLElement){
    prPanel.style.width = "20%";
    bodyPanel.style.width = "60%";
    this.isShowingPRPanel = true;
  }

  hidePRPanel(prPanel: HTMLElement, bodyPanel: HTMLElement): void {
    prPanel.style.width = "60px";

    /* 
      Calulates space leftover for the body panel after 
      accounting for the space taken up by the side panel.
    */
    bodyPanel.style.width = "calc(80% - 60px)";
    
    this.isShowingPRPanel = false;
  }
}