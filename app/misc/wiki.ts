let pageTitles = {}
function openWiki() {
    console.log("hi");
    let wikis = document.getElementById("wiki-panel")!;

    wikis.style.width = "100%";
    wikis.style.height = "100%";
    console.log(repoFullPath);
    cloneWiki();
}

function cloneWiki() {
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
    let cloneUrl = "https://github.com/kblincoe/VisualGit_SE701_2019_3.wiki.git";
    
    repoFullPath += "\\wiki";
    console.log(repoFullPath);
    let repository = Git.Clone.clone(cloneUrl, repoFullPath, options)
        .then(function (repository) {
            console.log("Wiki successfully cloned")
        }, function (err) {
            updateModalText("Clone Failed - " + err);
            console.log("repo.ts, line 64, failed to clone repo: " + err); // TODO show error on screen
            switchToAddRepositoryPanel();
        }
        );
    
}