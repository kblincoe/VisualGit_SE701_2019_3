let Git = require("nodegit");
let $ = require('jQuery');
let repoFullPath;
let repoLocalPath;
let bname = {};
let branchCommit = [];
let remoteName = {};
let localBranches = [];
let readFile = require("fs-sync");
let checkFile = require("fs");
let repoCurrentBranch = "master";
let modal;
let span;

function downloadRepository() {
  let fullLocalPath;
  // Full path is determined by either handwritten directory or selected by file browser
  if (document.getElementById("repoSave").value != null || document.getElementById("repoSave").value != "") {
    let localPath = document.getElementById("repoSave").value;
    fullLocalPath = require("path").join(__dirname, localPath);
  } else {
    fullLocalPath = document.getElementById("dirPickerSaveNew").files[0].path;
  }
  let cloneURL = document.getElementById("repoClone").value;

  if (!cloneURL || cloneURL.length === 0) {
      updateModalText("Clone Failed - Empty URL Given");
  } else {
      downloadFunc(cloneURL, fullLocalPath);
  }

}

function downloadFunc(cloneURL, fullLocalPath) {
  console.log("Path of cloning repo: " + fullLocalPath);

  let progressDiv = document.getElementById("cloneProgressDiv");
  progressDiv.style.visibility = "visible";

  let options = {};

  options = {
    fetchOpts: {
      callbacks: {
        certificateCheck: function() { return 1; },
        credentials: function() {
          return cred;
        },
        transferProgress: function (data) {
          let bytesRatio = data.receivedObjects()/data.totalObjects();
          updateProgressBar(bytesRatio);
        }
      }
    }
  };

  console.log("cloning into " + fullLocalPath);
  let repository = Git.Clone.clone(cloneURL, fullLocalPath, options)
  .then(function(repository) {
    progressDiv.style.visibility = 'collapse';
    updateProgressBar(0);
    console.log("Repo successfully cloned");
    refreshAll(repository);
    updateModalText("Clone Successful, repository saved under: " + fullLocalPath);
    addCommand("git clone " + cloneURL + " " + fullLocalPath);
    repoFullPath = fullLocalPath;
    repoLocalPath = fullLocalPath;
    refreshAll(repository);
  },
  function(err) {
    updateModalText("Clone Failed - " + err);
    console.log("repo.ts, line 64, failed to clone repo: " + err); // TODO show error on screen
  });
}

function updateProgressBar(ratio) {
  let progressBar = document.getElementById("cloneProgressBar");
  let percentage = Math.floor(ratio*100) + "%";
  progressBar.style.width = percentage;
  progressBar.innerHTML = percentage;
}

function openRepository() {
  // Full path is determined by either handwritten directory or selected by file browser
  if (document.getElementById("repoOpen").value == null || document.getElementById("repoOpen").value == "") {
    let localPath = document.getElementById("dirPickerOpenLocal").files[0].webkitRelativePath;
    let fullLocalPath = document.getElementById("dirPickerOpenLocal").files[0].path;
    document.getElementById("repoOpen").value = fullLocalPath;
    document.getElementById("repoOpen").text = fullLocalPath;
  } else {
    let localPath = document.getElementById("repoOpen").value;
    let fullLocalPath;
    if (checkFile.existsSync(localPath)) {
      fullLocalPath = localPath;
    } else {
      fullLocalPath = require("path").join(__dirname, localPath);
    }
  }

  console.log("Trying to open repository at " + fullLocalPath);
  displayModal("Opening Local Repository...");

  Git.Repository.open(fullLocalPath).then(function(repository) {
    repoFullPath = fullLocalPath;
    repoLocalPath = localPath;
    if (readFile.exists(repoFullPath + "/.git/MERGE_HEAD")) {
      let tid = readFile.read(repoFullPath + "/.git/MERGE_HEAD", null);
      console.log("current HEAD commit: " + tid);
    }
    refreshAll(repository);
    console.log("Repo successfully opened");
    updateModalText("Repository successfully opened");
  },
  function(err) {
    updateModalText("Opening Failed - " + err);
    console.log("repo.ts, line 101, cannot open repository: "+err); // TODO show error on screen
  });
}

function addBranchestoNode(thisB: string) {
  let elem = document.getElementById("otherBranches");
  elem.innerHTML = '';
  for (let i = 0; i < localBranches.length; i++) {
    if (localBranches[i] !== thisB) {
      console.log("local branch: " + localBranches[i]);
      let li = document.createElement("li");
      let a = document.createElement("a");
      a.appendChild(document.createTextNode(localBranches[i]));
      a.setAttribute("tabindex", "0");
      a.setAttribute("href", "#");
      li.appendChild(a);
      elem.appendChild(li);
    }
  }
}

function refreshAll(repository) {
  let branch;
  bname = [];
  repository.getCurrentBranch()
  .then(function(reference) {
    let branchParts = reference.name().split("/");
    console.log("branch parts: " + branchParts);
    branch = branchParts[branchParts.length - 1];
  },function(err) {
    console.log("repo.ts, line 131, cannot refresh repository list: " + err); // TODO show error on screen
  })
  .then(function() {
    return repository.getReferences(Git.Reference.TYPE.LISTALL);
  })
  .then(function(branchList) {
    let count = 0;
    clearBranchElement();
    for (let i = 0; i < branchList.length; i++) {
      console.log("branch name: " + branchList[i].name());
      let bp = branchList[i].name().split("/");
      Git.Reference.nameToId(repository, branchList[i].name()).then(function(oid) {
        // Use oid
        console.log("old id " + oid);
        if (branchList[i].isRemote()) {
          remoteName[bp[bp.length-1]] = oid;
        } else {
          branchCommit.push(branchList[i]);
          console.log(bp[bp.length - 1] + " adding to end of " + oid.tostrS());
          if (oid.tostrS() in bname) {
            bname[oid.tostrS()].push(branchList[i]);
          } else {
            bname[oid.tostrS()] = [branchList[i]];
          }
        }
      }, function(err) {
        console.log("repo.ts, line 157, could not find referenced branch" + err );
      });
      if (branchList[i].isRemote()) {
        if (localBranches.indexOf(bp[bp.length - 1]) < 0) {
          displayBranch(bp[bp.length - 1], "branch-dropdown", "checkoutRemoteBranch(this)");
        }
      } else {
        localBranches.push(bp[bp.length - 1]);
        displayBranch(bp[bp.length - 1], "branch-dropdown", "checkoutLocalBranch(this)");
      }

    }
  })
  .then(function() {
    console.log("Updating the graph and the labels");
    drawGraph();
    document.getElementById("repo-name").innerHTML = repoLocalPath;
    document.getElementById("branch-name").innerHTML = branch + '<span class="caret"></span>';
  });
}

function getAllBranches() {
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    return repo.getReferenceNames(Git.Reference.TYPE.LISTALL);
  })
  .then(function(branchList) {
    clearBranchElement();
    for (let i = 0; i < branchList.length; i++) {
      console.log("branch discovered: " + branchList[i]);
      let bp = branchList[i].split("/");
      if (bp[1] !== "remotes") {
        displayBranch(bp[bp.length - 1], "branch-dropdown", "checkoutLocalBranch(this)");
      }
      Git.Reference.nameToId(repos, branchList[i]).then(function(oid) {
        // Use oid
        console.log("old id " + oid);
      });
    }
  });
}

function getOtherBranches() {
  let list;
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    return repo.getReferenceNames(Git.Reference.TYPE.LISTALL);
  })
  .then(function(branchList) {
    clearMergeElement();
    list = branchList;
  })
  .then(function() {
    return repos.getCurrentBranch()
  })
  .then(function(ref) {
    let name = ref.name().split("/");
    console.log("merging remote branch with tracked local branch");
    clearBranchElement();
    for (let i = 0; i < list.length; i++) {
      let bp = list[i].split("/");
      if (bp[1] !== "remotes" && bp[bp.length - 1] !== name[name.length - 1]) {
        displayBranch(bp[bp.length - 1], "merge-dropdown", "mergeLocalBranches(this)");
      }
    }
  })

}

function clearMergeElement() {
  let ul = document.getElementById("merge-dropdown");
  ul.innerHTML = '';
}

function clearBranchElement() {
  let ul = document.getElementById("branch-dropdown");
  let li = document.getElementById("create-branch");
  ul.innerHTML = '';
  ul.appendChild(li);
}

function displayBranch(name, id, onclick) {
  let ul = document.getElementById(id);
  let li = document.createElement("li");
  let a = document.createElement("a");
  a.setAttribute("href", "#");
  a.setAttribute("class", "list-group-item");
  a.setAttribute("onclick", onclick);
  li.setAttribute("role", "presentation")
  a.appendChild(document.createTextNode(name));
  li.appendChild(a);
  ul.appendChild(li);
}

function checkoutLocalBranch(element) {
  let bn;
  console.log(typeof element);
  if (typeof element === "string") {
    bn = element;
  } else {
    bn = element.innerHTML;
  }
  console.log("name of branch being checked out: " + bn);
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    addCommand("git checkout " + bn);
    repo.checkoutBranch("refs/heads/" + bn)
    .then(function() {
      refreshAll(repo);
    }, function(err) {
      console.log("repo.tx, line 271, cannot checkout local branch: " + err);
    });
  })
}

function checkoutRemoteBranch(element) {
  let bn;
  if (typeof element === "string") {
    bn = element;
  } else {
    bn = element.innerHTML;
  }
  console.log("current branch name: " + bn);
  let repos;
  Git.Repository.open(repoFullPath)
  .then(function(repo) {
    repos = repo;
    addCommand("git fetch");
    addCommand("git checkout -b " + bn);
    let cid = remoteName[bn];
    console.log("name of remote branch:  " + cid);
    return Git.Commit.lookup(repo, cid);
  })
  .then(function(commit) {
    console.log("commiting");
    return Git.Branch.create(repos, bn, commit, 0);
  })
  .then(function(code) {
    console.log("name of local branch " + bn);
    repos.mergeBranches(bn, "origin/" + bn)
    .then(function() {
        refreshAll(repos);
        console.log("Pull successful");
    });
  }, function(err) {
    console.log("repo.ts, line 306, could not pull from repository" + err);
  })
}

function updateLocalPath() {
  let text = document.getElementById("repoClone").value;
  let splitText = text.split(/\.|:|\//);
  if (splitText.length >= 2) {
    document.getElementById("repoSave").value = splitText[splitText.length - 2];
  }
}

// function initModal() {
//   modal = document.getElementById("modal");
//   btn = document.getElementById("new-repo-button");
//   confirmBtn = document.getElementById("confirm-button");
//   span = document.getElementsByClassName("close")[0];
// }

// function handleModal() {
//   // When the user clicks on <span> (x), close the modal
//   span.onclick = function() {
//     modal.style.display = "none";
//   };
//
//   // When the user clicks anywhere outside of the modal, close it
//   window.onclick = function(event) {
//
//     if (event.target === modal) {
//       modal.style.display = "none";
//     }
//   };
// }

function displayModal(text) {
//  initModal();
//  handleModal();
  document.getElementById("modal-text-box").innerHTML = text;
  $('#modal').modal('show');
}

function updateModalText(text) {
  document.getElementById("modal-text-box").innerHTML = text;
  $('#modal').modal('show');
}
