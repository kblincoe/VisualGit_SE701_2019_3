import { Component } from "@angular/core";

@Component({
  selector: "wiki",
  templateUrl: 'app/components/wiki/wiki.component.html'
})

export class WikiComponent {
  closeWiki(): void {
    let editor = document.getElementById("wiki-panel")!;
    editor.style.height = "0vh";
    editor.style.width = "0vw";
    editor.style.zIndex = "-999";
    
    //Delete on close for testing purposes
    let localWikiPath = repoFullPath + "\\wiki"
    /*var rmdir = function (directory: string) {
      var list = fs.readdirSync(directory);
      for (var i = 0; i < list.length; i++) {
        var filename = path.join(directory, list[i]);
        var stat = fs.statSync(filename);

        if (filename == "..") {
          // pass these files
        } else if (stat.isDirectory()) {
          // rmdir recursively
          rmdir(filename);
        } else {
          // rm filename
          fs.unlinkSync(filename);
        }
      }
      fs.rmdirSync(directory);

    }
    rmdir(localWikiPath)*/
  }
  resetWiki(): void {
    //Method 1
    /*let name = "refs/remotes/origin/master"
    let repos;
    let localWikiPath = repoFullPath + "\\wiki"
    Git.Repository.open(localWikiPath)
      .then(function (repo) {
        repos = repo;
        console.log("The id from name is: ", Git.Reference.nameToId(repo, name))
        return Git.Reference.nameToId(repo, name);
      })
      .then(function (id) {
        console.log("looking for: " + id);
        console.log("The annotated commit looked up is: ", Git.AnnotatedCommit.lookup(repos, id));
        return Git.AnnotatedCommit.lookup(repos, id);
      })
      .then(function (commit) {
        let checkoutOptions = new Git.CheckoutOptions();
        console.log("The commit message is: ", commit.message)
        //return Git.Reset.fromAnnotated(repos, commit, Git.Reset.TYPE.HARD, checkoutOptions);
      })
      //Method 2
    var Reset = Git.Reset;
    let repository;

    Git.Repository.open(localWikiPath)
      .then(function (repo) {
        repository = repo;

        return repository.fetch('origin');
      })
      .then(function () {
        console.log("We're in here");
        return repository.getBranchCommit('origin/master');
      })
      .then(function (originHeadCommit) {
        //return Reset.reset(repository, originHeadCommit, Reset.TYPE.HARD);
      })
      .done(function (repo) {
        console.log("reset done");
      });*/
  }
  updateWiki() : void {
    updateWiki();
  }
}