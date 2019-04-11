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
    this.isShowingPRPanel ? this.hidePRPanel() : this.showPRPanel();
  }

  showPRPanel() {
    this.halfExtendPRPanel();
    this.getPRs((prs) => {
      this.populatePRPanel(prs);
    });
  }

  hidePRPanel(): void {
    let prPanel = document.getElementById("pull-request-panel");
    let bodyPanel = document.getElementById("body-panel");
    let prListContainer = document.getElementById("pr-list-container");
    let prDisplayPanel = document.getElementById("pr-display-panel");

    if (prPanel != null && bodyPanel != null && prListContainer != null && prDisplayPanel != null) {
      prPanel.style.width = "60px";
      prListContainer.style.display = "none";

      /* 
        Calulates space leftover for the body panel after 
        accounting for the space taken up by the side panel.
      */
      bodyPanel.style.width = "calc(80% - 60px)";

      prDisplayPanel.style.display = "none";

      this.isShowingPRPanel = false;
    }
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
    let gitConfigFileText = readFile.read(repoFullPath + "/.git/config", null);
    let searchString = "[remote \"origin\"]";

    gitConfigFileText = gitConfigFileText.substr(gitConfigFileText.indexOf(searchString) + searchString.length, gitConfigFileText.length);
    gitConfigFileText = gitConfigFileText.substr(0, gitConfigFileText.indexOf(".git"));

    let gitConfigFileSubstrings = gitConfigFileText.split('/');

    //If the remote branch was set up using ssh, separate the elements between colons"
    if (gitConfigFileSubstrings[0].indexOf("@") != -1) {
      gitConfigFileSubstrings[0] = gitConfigFileSubstrings[0].substring(gitConfigFileSubstrings[0].indexOf(":") + 1);
    }

    this.repoOwner = gitConfigFileSubstrings[gitConfigFileSubstrings.length - 2];
    this.repoName = gitConfigFileSubstrings[gitConfigFileSubstrings.length - 1];

    let url = this.apiLink + this.repoOwner + "/" + this.repoName;
    this.gitHubGetRequest(url, (response) => {
      if (response.fork) {
        this.repoOwner = response.parent.owner.login;
      } else {
        this.repoOwner = this.repoOwner;
      }
      callback();
    });
  }

  getPRs(callback: (pullRequests: any[]) => void): void {
    this.getRepoOwner(() => {
      let url = this.apiLink + this.repoOwner + "/" + this.repoName + "/pulls";
      this.gitHubGetRequest(url, (response) => {
        callback(response);
      });
    });
  }

  populatePRPanel(pullRequests: any[]) {
    let prList = document.getElementById("pr-list");

    if (prList != null) {
      prList.innerHTML = "";
      pullRequests.forEach((pr) => {
        let listElement = document.createElement("li");
        let link = document.createElement("a");
        link.className = "list-group-item";
        listElement.setAttribute("role", "presentation");

        link.innerHTML = "PR #" + pr.number + ": " + pr.title;
        link.onclick = (e) => {
          this.fullExtendPRPanel();
          this.createInitialPRPost(pr, () => {
            this.gitHubGetRequest(pr.comments_url, (response) => {
              response.forEach((comment: any) => {
                this.createCommentPost(comment);
              });
              this.createCommentInputArea(pr, () => {
                link.click();
              });
            });
          });
        };

        listElement.appendChild(link);

        prList!.appendChild(listElement);
      });
    }
  }

  createInitialPRPost(pr: any, callback: () => void): void {
    let outerRow = document.createElement("div");
    outerRow.className = "row";

    let column = document.createElement("div");
    column.className = "col-sm-8 col-sm-offset-2";

    let card = document.createElement("div");
    card.className = "pr-card";

    let prTitle = document.createElement("h1");
    let prTitleText = document.createTextNode("Pull Request #" + pr.number + ": " + pr.title);
    prTitle.appendChild(prTitleText);

    let prAuthor = document.createElement("h5");
    let prAuthorText = document.createTextNode(pr.user.login + " wants to merge " + pr.head.label + " into " + pr.base.label + ".");

    prAuthor.appendChild(prAuthorText);

    let prBody = document.createElement("p");
    let prBodyText = document.createTextNode(pr.body);
    prBody.appendChild(prBodyText);

    card.appendChild(prTitle);
    card.appendChild(prAuthor);
    card.appendChild(prBody);

    column.appendChild(card);

    outerRow.appendChild(column);

    let prDiv = document.getElementById("pr-div");
    if (prDiv != null) {
      prDiv.appendChild(outerRow);
    }

    callback();
  }

  createCommentPost(comment: any): void {
    let outerRow = document.createElement("div");
    outerRow.className = "row";

    let column = document.createElement("div");
    column.className = "col-sm-8 col-sm-offset-2";

    let card = document.createElement("div");
    card.className = "pr-card";

    let commentAuthor = document.createElement("h5");
    let commentAuthorText = document.createTextNode(comment.user.login + " commented:");
    commentAuthor.appendChild(commentAuthorText);

    let commentBody = document.createElement("p");
    let commentBodyText = document.createTextNode(comment.body);
    commentBody.appendChild(commentBodyText);

    card.appendChild(commentAuthor);
    card.appendChild(commentBody);

    column.appendChild(card);

    outerRow.appendChild(column);

    let prDiv = document.getElementById("pr-div");
    if (prDiv != null) {
      prDiv.appendChild(outerRow);
    }
  }

  createCommentInputArea(pr: any, callback: () => void): void {
    let outerRow = document.createElement("div");
    outerRow.className = "row";

    let column = document.createElement("div");
    column.className = "col-sm-8 col-sm-offset-2";

    let card = document.createElement("div");
    card.className = "pr-card";

    let createComment = document.createElement("h3");
    let createCommentText = document.createTextNode("Add a comment: ");
    createComment.appendChild(createCommentText);


    let commentInput = document.createElement("textarea");
    commentInput.className = "pr-comment-panel";

    let submitButton = document.createElement("button");
    submitButton.innerText = "Submit Comment";
    submitButton.className = "btn btn-success pr-comment-submit";

    submitButton.onclick = (e) => {
      if (commentInput.value === "" || commentInput.value == null) {
        createCommentText.textContent = "Please enter a comment: ";
      } else {
        let data = {
          "body": commentInput.value,
          "in_reply_to": pr.id
        };
        let jsonData = JSON.stringify(data)
        let url = "https://api.github.com/repos/" + this.repoOwner + "/" + this.repoName + "/issues/" + pr.number + "/comments"
        this.gitHubPostRequest(url, jsonData, (response) => {
          callback();
        });
      }
    };

    card.appendChild(createComment);
    card.appendChild(commentInput);
    card.appendChild(submitButton);

    column.appendChild(card);

    outerRow.appendChild(column);

    let prDiv = document.getElementById("pr-div");
    if (prDiv != null) {
      prDiv.appendChild(outerRow);
    }
  }

  halfExtendPRPanel(): void {
    let prPanel = document.getElementById("pull-request-panel");
    let bodyPanel = document.getElementById("body-panel");
    let prListContainer = document.getElementById("pr-list-container");
    let prDisplayPanel = document.getElementById("pr-display-panel");

    if (prPanel != null && bodyPanel != null && prListContainer != null && prDisplayPanel != null) {
      prPanel.style.width = "20%";
      bodyPanel.style.width = "60%";
      prListContainer.style.width = "calc(100% - 60px)";
      prListContainer.style.display = "block";
      prDisplayPanel.style.display = "none";
      this.isShowingPRPanel = true;
    }
  }

  fullExtendPRPanel(): void {
    let prPanel = document.getElementById("pull-request-panel");
    let bodyPanel = document.getElementById("body-panel");
    let prListContainer = document.getElementById("pr-list-container");
    let prDisplayPanel = document.getElementById("pr-display-panel");

    if (prPanel != null && bodyPanel != null && prListContainer != null && prDisplayPanel != null) {
      let prDiv = document.getElementById("pr-div");
      if (prDiv != null) {
        prDiv.innerHTML = "";
      }

      prPanel.style.width = "80%";
      bodyPanel.style.width = "0%";
      prListContainer.style.width = "25%";
      prDisplayPanel.style.width = "calc(75% - 60px)"
      prDisplayPanel.style.display = "block";
    }
  }

  gitHubGetRequest(url: string, callback: (response: any) => void) {
    $.ajax({
      url: url,
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
    });
  }

  gitHubPostRequest(url: string, data: string, callback: (response: any) => void) {
    $.ajax({
      url: url,
      type: "POST",
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', make_base_auth(getUsername(), getPassword()));
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      },
      contentType: "application/json",
      dataType: "json",
      data: data,
      success: function (response: any) {
        callback(response);
      },
      error(xhr, status, error) {
        console.log("The XML Http Request of the GitHub API call is: ", xhr);
        console.log("The status of the GitHub API call is: ", status);
        console.log("The error of the GitHub API call is: ", error);
      }
    });
  }
}