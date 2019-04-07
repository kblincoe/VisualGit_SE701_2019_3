let pageTitles = {}
let path = require('path');
let wikiPath = "";
let wikiContent: [any] = [{
    "pageName": "",
    "pageContent": ""
}]

function openWiki() {
    console.log("hi");
    let wikis = document.getElementById("wiki-panel")!;

    wikis.style.width = "100%";
    wikis.style.height = "100%";
    console.log(repoFullPath);
    if(!fs.exists(repoFullPath + "\\wiki")){
        cloneWiki();
    }else{
        findPageNames(repoFullPath + "\\wiki")
    }
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
    
    let wikiPath = repoFullPath + "\\wiki";
    console.log("The wiki path is: ", wikiPath);
    let repository = Git.Clone.clone(cloneUrl, wikiPath, options)
        .then(function (repository) {
            console.log("Wiki successfully cloned")
            findPageNames(wikiPath)
        }, function (err) {
            updateModalText("Clone Failed - " + err);
            console.log("repo.ts, line 64, failed to clone repo: " + err); // TODO show error on screen
            switchToAddRepositoryPanel();
        }
        );
}

//Extract list of all files (pages) in the wiki
function findPageNames(wikiPath: string) {

    var EXTENSION = '.md';

    fs.readdir(wikiPath, function (err, files) {
        console.log("The items are: ", files);

        var files = files.filter(function (file) {
            return path.extname(file).toLowerCase() === EXTENSION;
        });

        //Remove filler element
        wikiContent.shift()

        files.forEach(file => {
            wikiContent.push({
                "pageName": file.replace(/-/g, ' ').replace('.md', ''),
                "pageContent": readFileContents(wikiPath + "\\" + file)
            })
        });

    });
}

function readFileContents(wikiDirectory: string) {
    let markdownFile = readFile.read(wikiDirectory, null);
    return markdownFile;
}