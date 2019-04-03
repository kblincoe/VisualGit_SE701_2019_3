/// <reference path="git.ts" />

import { Json } from "@angular/core/src/facade/lang";
let $ = require("jquery");

//import * as nodegit from "git";
//import NodeGit, { Status } from "nodegit";

let Git = require("nodegit");
let repo;

let github = require("octonode");

let aid, atoken;
let client;
let avaterImg;
let repoList = {};
let url;
var signed = 0;
var changes = 0;


//Called then user pushes to sign out even if they have commited changes but not pushed; prompts a confirmation modal

function CommitNoPush() {
        if (CommitButNoPush == 1) {
                $("#modalW2").modal();
        }
}

function signInHead(callback) {
        encryptTemp(document.getElementById("Email1").value, document.getElementById("Password1").value);
        if (signed == 1) {
                if ((changes == 1) || (CommitButNoPush == 1)) {
                        $("#modalW2").modal();
                }
                else {
                        getUserInfo(callback);
                }
        }
        else {
          getUserInfo(callback);
        }
}

function LogInAfterConfirm(callback) {
        encryptTemp(document.getElementById("Email1").value, document.getElementById("Password1").value);
        getUserInfo(callback);
}

function ModalSignIn(callback) {
        encryptTemp(document.getElementById("Email1").value, document.getElementById("Password1").value);
        getUserInfo(callback);
}

function signInPage(callback) {
    // assigning the check box to a variable to check the value
    let rememberLogin: any = (<HTMLInputElement>document.getElementById("rememberLogin"));

    // username and password values taken to be stored.
    let username: any = (<HTMLInputElement>document.getElementById("username")).value;
    let password: any = (<HTMLInputElement>document.getElementById("password")).value;
    if (rememberLogin.checked == true) {
        encrypt(username, password);
    }

  getUserInfo(callback);
}


function loginWithSaved(callback) {

    document.getElementById("username").value = getUsername();
    document.getElementById("password").value = getPassword(); //get decrypted username n password  

}

function searchRepoName() {
  let ul = document.getElementById("repo-dropdown");

  ul.innerHTML = ''; // clears the dropdown menu which shows all the repos

  // Gets users name and password
  encryptTemp(document.getElementById("username").value, document.getElementById("password").value);

  cred = Git.Cred.userpassPlaintextNew(getUsernameTemp(), getPasswordTemp());

  client = github.client({
    username: getUsernameTemp(),
    password: getPasswordTemp()
  });

  var ghme = client.me();
  ghme.repos(function (err, data, head) {
    var ghme = client.me();

    for (let i = 0; i < data.length; i++) {

      let rep = Object.values(data)[i];
      console.log("url of repo: " + rep['html_url']);
      
      // Searches from the text input and adds to the list if repo name is found
      if (parseInt(rep['forks_count']) == 0) {
        if (rep['full_name'].search(document.getElementById("searchRep").value) != -1) {
          addSearchedName(rep['full_name'], "repo-dropdown", "selectRepo(this)");
          repoList[rep['full_name']] = rep['html_url'];
        }
      }

    }
  });
}

function getUserInfo(callback) {

  encryptTemp(document.getElementById("username").value, document.getElementById("password").value);

  cred = Git.Cred.userpassPlaintextNew(getUsernameTemp(), getPasswordTemp());

  client = github.client({
    username: getUsernameTemp(),
    password: getPasswordTemp()
  });
  var ghme = client.me();
  ghme.info(function(err, data, head) {
    if (err) {
      displayModal(err);
    } else {
      avaterImg = Object.values(data)[2]
      // let doc = document.getElementById("avater");
      // doc.innerHTML = "";
      // var elem = document.createElement("img");
      // elem.width = 40;
      // elem.height = 40;
      // elem.src = avaterImg;
      // doc.appendChild(elem);
      // doc = document.getElementById("log");
      // doc.innerHTML = 'sign out';
      var docGitUser = document.getElementById("githubname");
      //docGitUser.innerHTML = Object.values(data)[0];

      let doc = document.getElementById("avatar");
      //doc.innerHTML = 'Sign out'; //HAD TO REMOVE THIS LINE OR THE PROGRAM BROKE.
          signed = 1;

      callback();
    }
  });

  ghme.repos(function(err, data, head) {
    if (err) {
      return;
    } else {
      console.log("number of repos: " + data.length);
      for (let i = 0; i < data.length; i++) {
        let rep = Object.values(data)[i];
        console.log("url of repo: " + rep['html_url']);

        if(rep['fork'] == false) {
          if(parseInt(rep['forks_count']) == 0) {
            displayBranch(rep['full_name'], "repo-dropdown", "selectRepo(this)");
            repoList[rep['full_name']] = rep['html_url'];
          }
          else {
            //Create a collapseable list for the forked repo
            createDropDownFork(rep['full_name'],"repo-dropdown","showDropDown(this)");
            repoList[rep['full_name']] = rep['html_url'];
            //Reiterate through and get all the forks of the repo and add to list
            for(let i = 0; i < data.length; i++) {
              let rep2 = Object.values(data)[i];
              if(rep2['name'] == rep['name']) {
                displayBranch("&nbsp; &nbsp;" +rep2['full_name'],rep['full_name'],"selectRepo(this)")
                repoList["&nbsp; &nbsp;"+rep2['full_name']] = rep2['html_url'];
              }
            }
          }
        }
      }
    }
  });

}

function make_base_auth(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  return 'Basic ' + hash;
}

function showDropDown(ele) {
  //If the forked Repo is clicked collapse or uncollapse the forked repo list
  let div = document.getElementById(ele.className)
  if(div.style.display === 'none') {
    div.style.display = 'block';
  }
  else {
    div.style.display = 'none';
  }

}
function selectRepo(ele) {
  url = repoList[ele.innerHTML];
  let butt = document.getElementById("cloneButton");
  butt.innerHTML = 'Clone ' + ele.innerHTML;
  butt.setAttribute('class', 'btn btn-primary');
  console.log("selected " + ele.innerHTML + " as repository");
}

function cloneRepo() {
  if (url === null) {
    updateModalText("Web URL for repo could not be found. Try cloning by providing the repo's web URL directly in the 'Add repository' window");
    return;
  }

  console.log("cloning " + url);
  let splitUrl = url.split("/");
  let local;
  if (splitUrl.length >= 2) {
    local = splitUrl[splitUrl.length - 1];
  }
  console.log("cloning " + local);

  if (local == null) {
    updateModalText("Error: could not define name of repo");
    return;
  }

  downloadFunc(url, local);
  url = null;
  $('#repo-modal').modal('hide');

  switchToMainPanel();
}

function signInOrOut() {
  let doc = document.getElementById("avatar");
  if (doc.innerHTML == "Sign out") {
    $("#avatar").removeAttr("data-toggle");

    if (changes == 1 || CommitButNoPush == 1) {
      $("#modalW2").modal();
    } else {
      redirectToHomePage();
    }
  }
}

function redirectToHomePage() {
  window.onbeforeunload = Confirmed;
  window.location.href = "index.html";
  signed = 0;
  changes = 0;
  CommitButNoPush = 0; 
  //LogInAfterConfirm();
}