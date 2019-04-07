function openWiki() {
    console.log("hi");
    let wikis = document.getElementById("wiki-panel")!;

    wikis.style.width = "100%";
    wikis.style.height = "100%";
    console.log(repoFullPath);
    //cloneWiki();
}

function cloneWiki(){
    options = {
        fetchOpts: {
          callbacks: {
            certificateCheck: function () {
              return 1;
            },
            credentials: function () {
              return cred;
            },
            transferProgress: function (data) {
              let bytesRatio = data.receivedObjects() / data.totalObjects();
              updateProgressBar(bytesRatio);
            }
          }
        }
      };
    let cloneUrl = "https://github.com/pqua613/SOFTENG754-2019-A3.git";
    //console.log(repoName);
    
    let repository = Git.Clone.clone(cloneUrl,repoFullPath,options)
    .then(function (repository) {

        console.log("Repo successfully cloned");
        displayModal("Drawing graph, please wait");
        updateModalText("Clone Successful, repository saved under: " + fullLocalPath);
        addCommand("git clone " + cloneURL + " " + fullLocalPath);
        repoFullPath = fullLocalPath;
        repoLocalPath = fullLocalPath;
        displayModal("Drawing graph, please wait");
        refreshAll(repository);
        switchToMainPanel();
      },
      function (err) {
        updateModalText("Clone Failed - " + err);
        console.log("repo.ts, line 64, failed to clone repo: " + err); // TODO show error on screen
        switchToAddRepositoryPanel();
      });
}