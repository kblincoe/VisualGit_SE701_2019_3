import * as nodegit from "git";
import NodeGit, { Status } from "nodegit";

let opn = require('opn');
let $ = require("jquery");
let Git = require("nodegit");
let fs = require("fs");
let async = require("async");
let readFile = require("fs-sync");
let green = "#84db00";
let repo, index, oid, remote, commitMessage;
let filesToAdd = [];
let theirCommit = null;
let modifiedFiles;
let warnbool;
var CommitButNoPush = 0;
let stagedFiles: any;

function cloneFromRemote(){
  switchToClonePanel();
}

function refreshColor() {
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

function stage() {
  let repository;

  Git.Repository.open(repoFullPath)
      .then(function(repoResult) {
        repository = repoResult;
        console.log("found a repository");
        return repository.refreshIndex();
      })

      .then(function(indexResult) {
        console.log("found a file to stage");
        index = indexResult;
        let filesToStage = [];
        filesToAdd = [];
        let fileElements = document.getElementsByClassName('file');
        for (let i = 0; i < fileElements.length; i++) {
          let fileElementChildren = fileElements[i].childNodes;
          if (fileElementChildren[1].checked === true) {
            filesToStage.push(fileElementChildren[0].innerHTML);
            filesToAdd.push(fileElementChildren[0].innerHTML);
          }
        }
        if (filesToStage.length > 0) {
          console.log("staging files");
          stagedFiles = index.addAll(filesToStage);
        } else {
          //If no files checked, then throw error to stop empty commits
          throw new Error("No files selected to commit.");
        }
      });

  if (stagedFiles == null || stagedFiles.length !== 0) {
    if (document.getElementById("staged-files-message") !== null) {
      let filePanelMessage = document.getElementById("staged-files-message");
      filePanelMessage.parentNode.removeChild(filePanelMessage);
    }
  }
}

function addAndCommit() {
  commitMessage = document.getElementById('commit-message-input').value;
  if (commitMessage == null || commitMessage == "") {
    window.alert("Cannot commit without a commit message. Please add a commit message before committing");
    return;
  }
  let repository;

  Git.Repository.open(repoFullPath)
  .then(function(repoResult) {
    repository = repoResult;
    console.log("found a repository");
    return repository.refreshIndex();
  })

  .then(function(indexResult) {
    console.log("found a file to stage");
    index = indexResult;
    let filesToStage = [];
    filesToAdd = [];
    let fileElements = document.getElementsByClassName('file');
    for (let i = 0; i < fileElements.length; i++) {
      let fileElementChildren = fileElements[i].childNodes;
      if (fileElementChildren[1].checked === true) {
        filesToStage.push(fileElementChildren[0].innerHTML);
        filesToAdd.push(fileElementChildren[0].innerHTML);
      }
    }
    if (filesToStage.length > 0) {
      console.log("staging files");
      return index.addAll(filesToStage);
    } else {
      //If no files checked, then throw error to stop empty commits
      throw new Error("No files selected to commit.");
    }
  })

  .then(function() {
    console.log("found an index to write result to");
    return index.write();
  })

  .then(function() {
    console.log("creating a tree object using current index");
    return index.writeTree();
  })

  .then(function(oidResult) {
    console.log("changing " + oid + " to " + oidResult);
    oid = oidResult;
    return Git.Reference.nameToId(repository, "HEAD");
  })

  .then(function(head) {
    console.log("founf the current commit");
    return repository.getCommit(head);
  })

  .then(function(parent) {
    console.log("Verifying account");
    let sign;
    if (getUsernameTemp() !== null && getPasswordTemp !== null) {
      sign = Git.Signature.now(getUsernameTemp(), getPasswordTemp());
    } else {
      sign = Git.Signature.default(repository);
    }
    commitMessage = document.getElementById('commit-message-input').value;
    console.log("Signature to be put on commit: " + sign.toString());
    if (readFile.exists(repoFullPath + "/.git/MERGE_HEAD")) {
      let tid = readFile.read(repoFullPath + "/.git/MERGE_HEAD", null);
      console.log("head commit on remote: " + tid);
      console.log("head commit on local repository: " + parent.id.toString());
      return repository.createCommit("HEAD", sign, sign, commitMessage, oid, [parent.id().toString(), tid.trim()]);
    } else {
      console.log('no other commits');
      return repository.createCommit("HEAD", sign, sign, commitMessage, oid, [parent]);
    }
  })
  .then(function(oid) {
    theirCommit = null;
    console.log("Committing");
	changes = 0;
	CommitButNoPush = 1;
    console.log("Commit successful: " + oid.tostrS());
    stagedFiles = null;
    hideDiffPanel();
    clearStagedFilesList();
    clearCommitMessage();
    clearSelectAllCheckbox();
    for (let i = 0; i < filesToAdd.length; i++) {
      addCommand("git add " + filesToAdd[i]);
    }
    addCommand('git commit -m "' + commitMessage + '"');
    refreshAll(repository);
  }, function(err) {
    console.log("git.ts, line 112, could not commit, " + err);
    // Added error thrown for if files not selected
    if (err.message == "No files selected to commit.") {
      displayModal(err.message);
    } else {
      updateModalText("You have not logged in. Please login to commit a change");
    }
  });
}

function clearStagedFilesList() {
  let filePanel = document.getElementById("files-staged");
  while (filePanel.firstChild) {
    filePanel.removeChild(filePanel.firstChild);
  }
  let filesChangedMessage = document.createElement("p");
  filesChangedMessage.className = "modified-files-message";
  filesChangedMessage.id = "staged-files-message";
  filesChangedMessage.innerHTML = "Your staged files will appear here";
  filePanel.appendChild(filesChangedMessage);

  changeColor();
}

// Clear all modified files from the left file panel
function clearModifiedFilesList() {
  let filePanel = document.getElementById("files-changed");
  while (filePanel.firstChild) {
    filePanel.removeChild(filePanel.firstChild);
  }
  let filesChangedMessage = document.createElement("p");
  filesChangedMessage.className = "modified-files-message";
  filesChangedMessage.id = "modified-files-message";
  filesChangedMessage.innerHTML = "Your modified files will appear here";
  filePanel.appendChild(filesChangedMessage);
  const userColorFilePath = ".settings/user_color.txt";

  refreshColor();
}

function clearCommitMessage() {
  document.getElementById('commit-message-input').value = "";
}

function clearSelectAllCheckbox() {
  document.getElementById('select-all-checkbox').checked = false;
}

function getAllCommits(callback) {
  clearModifiedFilesList();
  let repos;
  let allCommits = [];
  let aclist = [];
  console.log("Finding all commits");
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    console.log("fetching all remote repositories");
    return repo.getReferences(Git.Reference.TYPE.LISTALL);
  })
  .then(function(refs) {
    let count = 0;
    console.log("getting " + refs.length + " remote repositories");
    async.whilst(
      function() {
        return count < refs.length;
      },

      function(cb) {
        if (!refs[count].isRemote()) {
          console.log("referenced branch exists on remote repository");
          repos.getReferenceCommit(refs[count])
          .then(function(commit) {
            let history = commit.history(Git.Revwalk.SORT.Time);
            history.on("end", function(commits) {
              for (let i = 0; i < commits.length; i++) {
                if (aclist.indexOf(commits[i].toString()) < 0) {
                  allCommits.push(commits[i]);
                  aclist.push(commits[i].toString());
                }
              }
              count++;
              console.log(count + " out of " + allCommits.length + " commits");
              cb();
            });

            history.start();
          });
        } else {
          console.log('current branch does not exist on remote');
          count++;
          cb();
        }
      },

      function(err) {
        console.log("git.ts, line 203, cannot load all commits" + err);
        callback(allCommits);
      });
    });
}

function PullBuffer(){
	if ((changes == 1) || (CommitButNoPush == 1)){
		$("#modalW3").modal();
	}
	else {
		pullFromRemote();
	}
}

function pullFromRemote() {
  let repository;
  let branch = document.getElementById("branch-name").innerText;
  if (modifiedFiles.length > 0) {
    updateModalText("Please commit before pulling from remote!");
  }
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repository = repo;
    console.log("Pulling new changes from the remote repository");
    addCommand("git pull");
    displayModal("Pulling new changes from the remote repository");

    return repository.fetchAll({
      callbacks: {
        credentials: function() {
          return cred;
        },
        certificateCheck: function() {
          return 1;
        }
      }
    });
  })
  // Now that we're finished fetching, go ahead and merge our local branch
  // with the new one
  .then(function() {
    return Git.Reference.nameToId(repository, "refs/remotes/origin/" + branch);
  })
  .then(function(oid) {
    console.log("Looking up commit with id " + oid + " in all repositories");
    return Git.AnnotatedCommit.lookup(repository, oid);
  }, function(err) {
    console.log("fetching all remgit.ts, line 251, cannot find repository with old id" + err);
  })
  .then(function(annotated) {
    console.log("merging " + annotated + "with local forcefully");
    Git.Merge.merge(repository, annotated, null, {
      checkoutStrategy: Git.Checkout.STRATEGY.FORCE,
    });
    theirCommit = annotated;
  })
  .then(function() {
    let conflicsExist = false;

    if (readFile.exists(repoFullPath + "/.git/MERGE_MSG")) {
      let tid = readFile.read(repoFullPath + "/.git/MERGE_MSG", null);
      conflicsExist = tid.indexOf("Conflicts") !== -1;
    }

    if(conflicsExist) {
      updateModalText("Conflicts exists! Please check files list on right side and solve conflicts before you commit again!");
      refreshAll(repository);
    } else {
      updateModalText("Successfully pulled from remote branch " + branch + ", and your repo is up to date now!");
      refreshAll(repository);
    }
  });
}

function pushToRemote() {
  let branch = document.getElementById("branch-name").innerText;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    console.log("Pushing changes to remote")
    displayModal("Pushing changes to remote...");
    addCommand("git push -u origin " + branch);
    repo.getRemotes()
    .then(function(remotes) {
      repo.getRemote(remotes[0])
      .then(function(remote) {
        return remote.push(
          ["refs/heads/" + branch + ":refs/heads/" + branch],
          {
            callbacks: {
              credentials: function() {
                return cred;
              }
            }
          }
        );
      })
      .then(function() {
		CommitButNoPush = 0;
		window.onbeforeunload = Confirmed;
        console.log("Push successful");
        updateModalText("Push successful");
        refreshAll(repo);
      });
    });
  });
}

function commitModal() {
  // TODO: implement commit modal
  displayModal("Commit inside a modal yet to be implemented");
}

function openBranch() {
  // TODO: implement branch functionality like sourcetree branching modal
  displayModal("Branch yet to be implemented");
}

function createBranch() {
  if (typeof repoFullPath === "undefined") {
    // repository not selected
    displayModal("Please select the repository you want to create a branch of/ Disable the Branch Icon");
  } else {
    let branchName = document.getElementById("branchName").value;
    let repos;

    console.log(branchName + " is being created");
    Git.Repository.open(repoFullPath)
        .then(function (repo) {
          // Create a new branch on head
          repos = repo;
          addCommand("git branch " + branchName);
          return repo.getHeadCommit()
              .then(function (commit) {
                return repo.createBranch(
                    branchName,
                    commit,
                    0,
                    repo.defaultSignature(),
                    "Created new-branch on HEAD");
              }, function (err) {
                console.log("git.ts, line 337, error occurred while trying to create a new branch " + err);
              });
        }).done(function () {
      refreshAll(repos);
      console.log("All done!");
    });
    document.getElementById("branchName").value = "";
  }
}

// Deletes a local branch
function deleteLocalBranch() {
  $('#delete-branch-modal').modal('toggle') // open warning modal
  let branchName = document.getElementById("branch-to-delete").value; // selected branch name
  console.log("deleting branch: " + branchName)
  let repos;
  console.log(branchName + " is being deleted...")
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    addCommand("git branch --delete " + branchName);

    //check if the selected branch is a local branch
    repo.getBranch(branchName).then(function(reference) {
      Git.Branch.delete(reference) // delete local branch
    })
    }).then(function() {
      // refresh graph
      console.log("deleted the local branch")
      refreshAll(repos);
   })
}

// Deletes a remote branch
function deleteRemoteBranch() {
  $('#delete-branch-modal').modal('toggle') // open warning modal
  let branchName = document.getElementById("branch-to-delete").value; // selected branch name
  let repos;
  console.log(branchName + " is being deleted...");

  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    Git.Reference.list(repo).then(function(array) {
      if (array.includes("refs/remotes/origin/" + branchName)) {  // check if the branch is remote
        console.log("this is a remote branch")

         // delete the remote branch
        repo.getRemote('origin').then(function(remote) {
          remote.push((':refs/heads/' + branchName),
          {
            callbacks: { // pass in user credentials as a parameter
              credentials: function() {
                return cred;
              }
            }
          }).then(function() {
              console.log("deleted the remote branch")
              updateModalText("The remote branch: " + branchName + " has been deleted")
          });
        })
      }
      else{
        console.log("this is a local branch")
        updateModalText("A remote branch called: " + branchName + " does not exist.")
        return;
      }
    })
  })
}

function mergeLocalBranches(element) {
  let bn = element.innerHTML;
  let fromBranch;
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
  })
  .then(function() {
    addCommand("git merge " + bn);
    return repos.getBranch("refs/heads/" + bn);
  })
  .then(function(branch) {
    console.log("branch to merge from: " + branch.name());
    fromBranch = branch;
    return repos.getCurrentBranch();
  })
  .then(function(toBranch) {
    console.log("branch to merge to: " + toBranch.name());
    return repos.mergeBranches(toBranch,
       fromBranch,
       repos.defaultSignature(),
       Git.Merge.PREFERENCE.NONE,
       null);
  })
  .then(function(index) {
    let text;
    console.log("Checking for conflicts in merge at " + index);
    if (index instanceof Git.Index) {
      text = "Conflicts Exist";
    } else {
      text = "Merge Successfully";
    }
    console.log(text);
    updateModalText(text);
    refreshAll(repos);
  });
}

function mergeCommits(from) {
  let repos;
  let index;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    //return repos.getCommit(fromSha);
    addCommand("git merge " + from);
    return Git.Reference.nameToId(repos, 'refs/heads/' + from);
  })
  .then(function(oid) {
    console.log("Looking for commit with id " + oid + " in repositories");
    return Git.AnnotatedCommit.lookup(repos, oid);
  })
  .then(function(annotated) {
    console.log("Force merge commit " + annotates + " into HEAD");
    Git.Merge.merge(repos, annotated, null, {
      checkoutStrategy: Git.Checkout.STRATEGY.FORCE,
    });
    theirCommit = annotated;
  })
  .then(function() {
    if (fs.existsSync(repoFullPath + "/.git/MERGE_MSG")) {
      updateModalText("Conflicts exists! Please check files list on right side and solve conflicts before you commit again!");
      refreshAll(repos);
    } else {
      updateModalText("Successfully Merged!");
      refreshAll(repos);
    }
  });
}

function rebaseCommits(from: string, to: string) {
  let repos;
  let index;
  let branch;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    //return repos.getCommit(fromSha);
    addCommand("git rebase " + to);
    return Git.Reference.nameToId(repos, 'refs/heads/' + from);
  })
  .then(function(oid) {
    console.log("Looking for commit id: " + oid + " in repositories");
    return Git.AnnotatedCommit.lookup(repos, oid);
  })
  .then(function(annotated) {
    console.log("finding the id of " + annotated);
    branch = annotated;
    return Git.Reference.nameToId(repos, 'refs/heads/' + to);
  })
  .then(function(oid) {
    console.log("" + oid);
    return Git.AnnotatedCommit.lookup(repos, oid);
  })
  .then(function(annotated) {
    console.log("Changing commit message");
    return Git.Rebase.init(repos, branch, annotated, null, null);
  })
  .then(function(rebase) {
    console.log("Rebasing");
    return rebase.next();
  })
  .then(function(operation) {
    refreshAll(repos);
  });
}

function rebaseInMenu(from: string, to: string) {
  let p1 = document.getElementById("fromRebase");
  let p2 = document.getElementById("toRebase");
  let p3 = document.getElementById("rebaseModalBody");
  p1.innerHTML = from;
  p2.innerHTML = to;
  p3.innerHTML = "Do you want to rebase branch " + from + " to " + to + " ?";
  $("#rebaseModal").modal('show');
}

function mergeInMenu(from: string) {
  let p1 = document.getElementById("fromMerge");
  let p3 = document.getElementById("mergeModalBody");
  p1.innerHTML = from;
  p3.innerHTML = "Do you want to merge branch " + from + " to HEAD ?";
  $("#mergeModal").modal('show');
}

function resetCommit(name: string) {
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    addCommand("git reset --hard");
    return Git.Reference.nameToId(repo, name);
  })
  .then(function(id) {
    console.log("looking for: " + id);
    return Git.AnnotatedCommit.lookup(repos, id);
  })
  .then(function(commit) {
    let checkoutOptions = new Git.CheckoutOptions();
    return Git.Reset.fromAnnotated(repos, commit, Git.Reset.TYPE.HARD, checkoutOptions);
  })
  .then(function(number) {
    console.log("resetting " + number);
    if (number !== 0) {
      updateModalText("Reset failed, please check if you have pushed the commit.");
    } else {
      updateModalText("Reset successfully.");
    }
    refreshAll(repos);
  }, function(err) {
    updateModalText(err);
  });
}

function revertCommit(name: string) {
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    console.log("Reverting commit");
    addCommand("git revert " + name + "~1");
    return Git.Reference.nameToId(repo, name);
  })
  .then(function(id) {
    console.log("Looking for repository with id: " + id);
    return Git.Commit.lookup(repos, id);
  })
  .then(function(commit) {
    let revertOptions = new Git.RevertOptions();
    if (commit.parents().length > 1) {
      revertOptions.mainline = 1;
    }
    return Git.Revert.revert(repos, commit, revertOptions);
  })
  .then(function(number) {
    console.log("Reverting to " + number);
    if (number === -1) {
      updateModalText("Revert failed, please check if you have pushed the commit.");
    } else {
      updateModalText("Revert successfully.");
    }
    refreshAll(repos);
  }, function(err) {
    updateModalText(err);
  });
}

// Makes a modal for confirmation pop up instead of actually exiting application for confirmation.
function ExitBeforePush(){
	$("#modalW").modal();
}

function Confirmed(){

}

// makes the onbeforeunload function nothing so the window actually closes; then closes it.
function Close(){
	window.onbeforeunload = Confirmed;
	window.close();

}



function Reload(){
	window.onbeforeunload = Confirmed;
	location.reload();
}

function displayModifiedFiles() {
  modifiedFiles = [];

  let selectedFile = "";
  
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    console.log("Is repo merging: " + repo.isMerging());
    repo.getStatus().then(function(statuses) {

      statuses.forEach(addModifiedFile);
      if (modifiedFiles.length !== 0) {
        if (document.getElementById("modified-files-message") !== null) {
          let filePanelMessage = document.getElementById("modified-files-message");
          filePanelMessage.parentNode.removeChild(filePanelMessage);
        }
      }
      
      modifiedFiles.forEach(displayModifiedFile);
      refreshColor();
      // Add modified file to array of modified files 'modifiedFiles'
      function addModifiedFile(file) {

        // Check if modified file  is already being displayed
        let filePaths = document.getElementsByClassName('file-path');
        for (let i = 0; i < filePaths.length; i++) {         
          if (filePaths[i].innerHTML === file.path()) {
            return;
          }
          // If previously displayed file is not the new modified file
          // then check if it exists, else remove 
          let filePath = repoFullPath + "\/" + filePaths[i].innerHTML;
          if (fs.existsSync(filePath)) {
            // exists
            console.log("exists");
          } else {
            // doesn't exist
            console.log("doesn't exists");
            filePaths[i].parentElement.remove();
          }
        }

        

        let path = file.path();
        let modification = calculateModification(file);
        
      
      
        
        modifiedFiles.push({
            filePath: path,
            fileModification: modification
          })
      }


      // Find HOW the file has been modified
      function calculateModification(status) {
        if (status.isNew()) {
          return "NEW";
        } else if (status.isModified()) {
          return "MODIFIED";
        } else if (status.isDeleted()) {
          return "DELETED";
        } else if (status.isTypechange()) {
          return "TYPECHANGE";
        } else if (status.isRenamed()) {
          return "RENAMED";
        } else if (status.isIgnored()) {
          return "IGNORED";
        }
      }

	  function Confirmation(){
		$("#modalW").modal();
		return 'Hi';
	}

      function unstage(file, fileId) {
        // Get the fileId element and remove it
        document.getElementById(fileId).remove();
        let modFilesMessage = document.getElementById("modified-files-message");
        if (modFilesMessage != null) {
          modFilesMessage.remove();
        }
        // Check if there's no staged files, in case we need to print the "Your staged..."
        stagedFiles = index.remove(file);
        if (document.getElementById("files-staged").children.length == 0) {
          clearStagedFilesList();
          stagedFiles = null;
        }

        displayModifiedFile(file);
        refreshColor();
      }

      document.getElementById("stage-all").onclick = function() {
        let unstagedFileElements = document.getElementById('files-changed').children;
        while (unstagedFileElements.length > 0) {
          let checkbox = unstagedFileElements[0].getElementsByTagName("input")[0];
          try {
            checkbox.click();
          } catch (err) {
            break;
          }
        }
      };

      document.getElementById("unstage-all").onclick = function () {
        let stagedFileElements = document.getElementById('files-staged').children;
        while (stagedFileElements.length > 0){
          let checkbox = stagedFileElements[0].getElementsByTagName("input")[0];
          try {
            checkbox.click()
          } catch (err) {
            break;
          }
        }
      };

      function displayModifiedFile(file) {
        let filePath = document.createElement("p");
        filePath.className = "file-path";
        filePath.innerHTML = file.filePath;
        let fileElement = document.createElement("div");
		window.onbeforeunload = Confirmation;
		changes = 1;
        // Set how the file has been modified
        if (file.fileModification === "NEW") {
          fileElement.className = "file file-created";
        } else if (file.fileModification === "MODIFIED") {
          fileElement.className = "file file-modified";
        } else if (file.fileModification === "DELETED") {
          fileElement.className = "file file-deleted";
        }  else if (file.fileModification === "RENAMED") {
          fileElement.className = "file file-renamed";
        }else {
          fileElement.className = "file";
        }

        fileElement.appendChild(filePath);
        fileElement.id = file.filePath;

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "checkbox";
        checkbox.onclick = function(event){
          if (checkbox.checked) {
            stage();
            displayStagedFile(file, fileElement.id);
            refreshColor();
          }
          // Stops a click from propagating to the other layers
          event.stopPropagation();
        }
        fileElement.appendChild(checkbox);

        document.getElementById("files-changed").appendChild(fileElement);


        fileElement.onclick = function() {
          let doc = document.getElementById("diff-panel");
          console.log("width of document: " + doc.style.width);
          let fileName = document.createElement("p");
          fileName.innerHTML = file.filePath
            // Get the filename being edited and displays on top of the window
          if (doc.style.width === '0px' || doc.style.width === '') {
            displayDiffPanel();

            document.getElementById("diff-panel-body")!.innerHTML = "";
            document.getElementById("diff-panel-body").appendChild(fileName);
            if (fileElement.className === "file file-created") {
              // set the selected file
              selectedFile = file.filePath;
              printNewFile(file.filePath);
            } else {

              let diffCols = document.createElement("div");
              diffCols.innerText = "Old" + "\t" + "New" + "\t" + "+/-" + "\t" + "Content";
              document.getElementById("diff-panel-body")!.appendChild(diffCols);
              selectedFile = file.filePath;
              printFileDiff(file.filePath);
            }
          }
          else if (doc.style.width === '40%') {
            document.getElementById("diff-panel-body").innerHTML = "";
            document.getElementById("diff-panel-body").appendChild(fileName);
            if (selectedFile === file.filePath) {
              // clear the selected file when diff panel is hidden
              selectedFile = "";
              hideDiffPanel()
            } else {
              if (fileElement.className === "file file-created") {
                selectedFile = file.filePath;
                printNewFile(file.filePath);
              } else {
                selectedFile = file.filePath;
                printFileDiff(file.filePath);
              }
            }
          }
          else {
            // clear the selected file when diff panel is hidden
            selectedFile = "";
            hideDiffPanel();
          }
        };
      }

      function displayStagedFile(file, fileId) {
        let filePath = document.createElement("p");
        filePath.className = "file-path";
        filePath.innerHTML = file.filePath;
        let fileElement = document.createElement("div");
        window.onbeforeunload = Confirmation;
        changes = 1;
        // Set how the file has been modified
        if (file.fileModification === "NEW") {
          fileElement.className = "file file-created";
        } else if (file.fileModification === "MODIFIED") {
          fileElement.className = "file file-modified";
        } else if (file.fileModification === "DELETED") {
          fileElement.className = "file file-deleted";
        }  else if (file.fileModification === "RENAMED") {
          fileElement.className = "file file-renamed";
        }else {
          fileElement.className = "file";
        }

        fileElement.id = fileId;
        fileElement.appendChild(filePath);

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "checkbox";
        checkbox.checked = true;
        checkbox.onclick = function(event){
          unstage(file, fileId);
          // Stops a click from propagating to the other layers
          event.stopPropagation();
        }
        fileElement.appendChild(checkbox);

        document.getElementById("files-staged").appendChild(fileElement);
        document.getElementById(fileId).remove();

        if (document.getElementById("files-changed").children.length == 0) {
          clearModifiedFilesList();
        }

        fileElement.onclick = function() {
          let doc = document.getElementById("diff-panel");
          console.log("width of document: " + doc.style.width);
          let fileName = document.createElement("p");
          fileName.innerHTML = file.filePath
            // Get the filename being edited and displays on top of the window
          if (doc.style.width === '0px' || doc.style.width === '') {
            displayDiffPanel();

            document.getElementById("diff-panel-body")!.innerHTML = "";
            document.getElementById("diff-panel-body").appendChild(fileName);
            if (fileElement.className === "file file-created") {
              // set the selected file
              selectedFile = file.filePath;
              printNewFile(file.filePath);
            } else {

              let diffCols = document.createElement("div");
              diffCols.innerText = "Old" + "\t" + "New" + "\t" + "+/-" + "\t" + "Content";
              document.getElementById("diff-panel-body")!.appendChild(diffCols);
              selectedFile = file.filePath;
              printFileDiff(file.filePath);
            }
          }
          else if (doc.style.width === '40%') {
            document.getElementById("diff-panel-body").innerHTML = "";
            document.getElementById("diff-panel-body").appendChild(fileName);
            if (selectedFile === file.filePath) {
              // clear the selected file when diff panel is hidden
              selectedFile = "";
              hideDiffPanel()
            } else {
              if (fileElement.className === "file file-created") {
                selectedFile = file.filePath;
                printNewFile(file.filePath);
              } else {
                selectedFile = file.filePath;
                printFileDiff(file.filePath);
              }
            }
          }
          else {
            // clear the selected file when diff panel is hidden
            selectedFile = "";
            hideDiffPanel();
          }
        };
      }

      function printNewFile(filePath) {
        let fileLocation = require("path").join(repoFullPath, filePath);
        let lineReader = require("readline").createInterface({
          input: fs.createReadStream(fileLocation)
        });

        lineReader.on("line", function (line) {
          formatNewFileLine(line);
        });
      }

      function printFileDiff(filePath) {
        repo.getHeadCommit().then(function(commit) {
          getCurrentDiff(commit, filePath, function(line) {
            formatLine(line);
          });
        });
      }

      function getCurrentDiff(commit, filePath, callback) {
        commit.getTree().then(function(tree) {
          Git.Diff.treeToWorkdir(repo, tree, null).then(function(diff) {
            diff.patches().then(function(patches) {
              patches.forEach(function(patch) {
                patch.hunks().then(function(hunks) {
                  hunks.forEach(function(hunk) {
                    hunk.lines().then(function(lines) {
                      let oldFilePath = patch.oldFile().path();
                      let newFilePath = patch.newFile().path();
                      if (newFilePath === filePath) {
                        lines.forEach(function(line) {

                          // Catch the "no newline at end of file" lines created by git
                          if (line.origin() != 62) {

                            // include linenumbers and change type
                            callback( String.fromCharCode(line.origin())
                            + (line.oldLineno() != -1 ? line.oldLineno() : "") 
                            + "\t" + (line.newLineno() != -1 ? line.newLineno() : "")
                            + "\t" + String.fromCharCode(line.origin())
                            + "\t" + line.content());
                          }
                        });
                      }
                    });
                  });
                });
              });
            });
          });
        });
      }

      function formatLine(line) {
        let element = document.createElement("div");

        if (line.charAt(0) === "+") {
          element.style.backgroundColor = "#84db00";
        } else if (line.charAt(0) === "-") {
          element.style.backgroundColor = "#ff2448";
        }

        // If not a changed line, origin will be a space character, so still need to slice
        line = line.slice(1, line.length);
        element.innerText = line;

        // The spacer is needed to pad out the line to highlight the whole row
        let spacer = document.createElement("spacer");
        spacer.style.width = document.getElementById("diff-panel-body")!.scrollWidth+"px";
        element.appendChild(spacer);

        document.getElementById("diff-panel-body")!.appendChild(element);
      }

      function formatNewFileLine(text) {
        let element = document.createElement("div");
        element.style.backgroundColor = green;
        element.innerHTML = text;

        // The spacer is needed to pad out the line to highlight the whole row
        let spacer = document.createElement("spacer");
        spacer.style.width = document.getElementById("diff-panel-body")!.scrollWidth+"px";
        element.appendChild(spacer);
        
        document.getElementById("diff-panel-body")!.appendChild(element);
      }
    });
  },
  function(err) {
    console.log("waiting for repo to be initialised");
  });
}

// Find HOW the file has been modified
function calculateModification(status) {
  if (status.isNew()) {
    return "NEW";
  } else if (status.isModified()) {
    return "MODIFIED";
  } else if (status.isDeleted()) {
    return "DELETED";
  } else if (status.isTypechange()) {
    return "TYPECHANGE";
  } else if (status.isRenamed()) {
    return "RENAMED";
  } else if (status.isIgnored()) {
    return "IGNORED";
  }
}

function deleteFile(filePath: string) {
  let newFilePath = filePath.replace(/\\/gi, "/");
  if (fs.existsSync(newFilePath)) {
    fs.unlink(newFilePath, (err) => {
      if (err) {
        alert("An error occurred updating the file" + err.message);
        console.log("git.ts, line 759, an error occurred updating the file " + err);
        return;
      }
      console.log("File successfully deleted");
    });
  } else {
    alert("This file doesn't exist, cannot delete");
  }
}

function cleanRepo() {
  let fileCount = 0;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    console.log("Removing untracked files")
    displayModal("Removing untracked files...");
    addCommand("git clean -f");
    repo.getStatus().then(function(arrayStatusFiles) {
      arrayStatusFiles.forEach(deleteUntrackedFiles);

      //Gets NEW/untracked files and deletes them
      function deleteUntrackedFiles(file) {
        let filePath = repoFullPath + "\\" + file.path();
        let modification = calculateModification(file);
        if(modification === "NEW") {
          console.log("DELETING FILE " + filePath);
          deleteFile(filePath);
          console.log("DELETION SUCCESSFUL");
          fileCount++;
        }
      }

    })
    .then(function() {
      console.log("Cleanup successful");
      if(fileCount !== 0) {
        updateModalText("Cleanup successful. Removed " + fileCount + " files.");
      } else {
        updateModalText("Nothing to remove.")
      }
      refreshAll(repo);
    });
  },
  function(err) {
    console.log("Waiting for repo to be initialised");
    displayModal("Please select a valid repository");
  });
}

/**
 * This method is called when the sync button is pressed, and causes the fetch-modal 
 * to appear on the screen.
 */
function requestLinkModal() {
  $("#fetch-modal").modal();
}

/**
 * This method is called when a valid URL is given via the fetch-modal, and runs the 
 * series of git commands which fetch and merge from an upstream repository.
 */
function fetchFromOrigin() {
  console.log("begin fetching");
  let upstreamRepoPath = document.getElementById("origin-path").value;
  if (upstreamRepoPath != null) {
    Git.Repository.open(repoFullPath)
    .then(function(repo) {
      console.log("fetch path valid")
      displayModal("Beginning Synchronisation...");
      addCommand("git remote add upstream " + upstreamRepoPath);
      addCommand("git fetch upstream");
      addCommand("git merge upstrean/master");
      console.log("fetch successful")
      updateModalText("Synchronisation Successful");
      refreshAll(repo);
    },
    function(err) {
      console.log("Waiting for repo to be initialised");
      displayModal("Please select a valid repository");
    });
  } else {
    displayModal("No Path Found.")
  }
}
