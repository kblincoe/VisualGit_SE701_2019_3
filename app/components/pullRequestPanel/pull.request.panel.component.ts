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

  /*
    Stores the base link for all the API calls
    in this component.
  */
  apiLink = "https://api.github.com/repos/"

  repoOwner = "";
  repoName = "";

  // Hides/unhides the PR panel based on it's current status.
  togglePRPanel(): void {
    let prPanel = document.getElementById("pull-request-panel");
    let bodyPanel = document.getElementById("body-panel");
    let prListContainer = document.getElementById("pr-list-container");

    if (prPanel != null && bodyPanel != null && prListContainer != null) {
      this.isShowingPRPanel ? this.hidePRPanel(prPanel, bodyPanel, prListContainer) : this.showPRPanel(prPanel, bodyPanel, prListContainer);
    }
  }

  showPRPanel(prPanel: HTMLElement, bodyPanel: HTMLElement, prListContainer: HTMLElement) {
    prPanel.style.width = "20%";
    bodyPanel.style.width = "60%";
    prListContainer.style.display = "block";
    this.isShowingPRPanel = true;
    this.getPRs(this.populatePRPanel);
  }

  hidePRPanel(prPanel: HTMLElement, bodyPanel: HTMLElement, prListContainer: HTMLElement): void {
    prPanel.style.width = "60px";
    prListContainer.style.display = "none";

    /* 
      Calulates space leftover for the body panel after 
      accounting for the space taken up by the side panel.
    */
    bodyPanel.style.width = "calc(80% - 60px)";

    this.isShowingPRPanel = false;
  }

  getRepoName(): string {
    let repoName = document.getElementById('repo-name');
    if (repoName != null) {
      this.repoName = repoName.innerHTML.split("/")[1];
      return this.repoName;
    }
    return "";
  }

  getRepoOwner(callback: () => void) {
    $.ajax({
      url: this.apiLink + getUsername() + "/" + this.getRepoName(),
      type: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', make_base_auth(getUsername(), getPassword()));
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      },
      success: function (response: any) {
        if (response.fork) {
          this.repoOwner = response.parent.owner.login;
        } else {
          this.repoOwner = response.owner.login;
        }
        callback();
      },
      error(xhr, status, error) {
        console.log("The XML Http Request of the GitHub API call is: ", xhr);
        console.log("The status of the GitHub API call is: ", status);
        console.log("The error of the GitHub API call is: ", error);
      }
    });
  }

  getPRs(callback: (pullRequests: any[]) => void): void {
    this.getRepoOwner(() => {
      /* 
        For some reason, there is already a slash between
        repoOwner and repoName. Adding an extra slash in 
        the middle results in the url looking like:
        username/repoOwner//repoName/pulls
        which returns a 404.
      */
      $.ajax({
        url: this.apiLink + getUsername() + "/" + this.repoOwner + this.repoName + "/pulls",
        type: "GET",
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', make_base_auth(getUsername(), getPassword()));
        },
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        },
        success: function (response: any) {
          callback(response);
        },
        error(xhr, status, error) {
          console.log("The XML Http Request of the GitHub API call is: ", xhr);
          console.log("The status of the GitHub API call is: ", status);
          console.log("The error of the GitHub API call is: ", error);
        }
      })
    });
  }

  populatePRPanel(pullRequests: any[]) {
    let prList = document.getElementById("pr-list");

    if (prList != null) {
      pullRequests.forEach((pr) => {
        let listElement = document.createElement("li");
        let link = document.createElement("a");
        link.className = "list-group-item";
        listElement.setAttribute("role", "presentation");

        link.innerHTML = "PR #" + pr.number + ": " + pr.title;

        listElement.appendChild(link);

        prList!.appendChild(listElement);
      });
    }
  }
}