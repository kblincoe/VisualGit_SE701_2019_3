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
    let prPanel = document.getElementById("pull-request-panel");
    let bodyPanel = document.getElementById("body-panel");
    let prListContainer = document.getElementById("pr-list-container");

    if (prPanel != null && bodyPanel != null && prListContainer != null) {
      prPanel.style.width = "20%";
      bodyPanel.style.width = "60%";
      prListContainer.style.width = "calc(100% - 60px)";
      prListContainer.style.display = "block";
      this.isShowingPRPanel = true;
      this.getPRs(this.populatePRPanel);
    }
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

        /* 
          Putting the onclick functionality into a seperate
          function and calling said function breaks for some
          reason.
          Error: 
            Uncaught TypeError: Cannot read property 'functionName'
              of undefined.
          As a result, I was forced to put the functionality within
          the lambda expression.
        */
        link.onclick = (e) => {
          console.log("this is the pr");
          console.log(pr);
          let prPanel = document.getElementById("pull-request-panel");
          let bodyPanel = document.getElementById("body-panel");
          let prListContainer = document.getElementById("pr-list-container");
          let prDisplayPanel = document.getElementById("pr-display-panel");

          if (prPanel != null && bodyPanel != null && prListContainer != null && prDisplayPanel != null) {
            prPanel.style.width = "80%";
            bodyPanel.style.width = "0%";
            prListContainer.style.width = "25%";
            prDisplayPanel.style.width = "calc(75% - 60px)"
            prDisplayPanel.style.display = "block";

            // Creation of initial PR post.
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

            prDisplayPanel.appendChild(outerRow);

            // End creation of initial PR post.

            $.ajax({
              url: pr.comments_url,
              type: "GET",
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', make_base_auth(getUsername(), getPassword()));
              },
              headers: {
                'Accept': 'application/vnd.github.v3+json'
              },
              success: function (response: any) {
                response.forEach((comment: any) => {
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

                  prDisplayPanel!.appendChild(outerRow);
                });
              },
              error(xhr, status, error) {
                console.log("The XML Http Request of the GitHub API call is: ", xhr);
                console.log("The status of the GitHub API call is: ", status);
                console.log("The error of the GitHub API call is: ", error);
              }
            })


          }
        }
        listElement.appendChild(link);

        prList!.appendChild(listElement);
      });
    }
  }

  dfjghfdj(): void {

  }
}