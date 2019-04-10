let cred;
let blue = "#39c0ba";
let gray = "#5b6969";
let continuedWithoutSignIn = false;
let showUsername = true;
let previousWindow = "repoPanel";
function collapseSignPanel() {
  $("#nav-collapse1").collapse("hide");
}

function switchToClonePanel() {
  console.log("switch to clone panel");
  hideAuthenticatePanel();
  hideFilePanel();
  hideGraphPanel();
  displayClonePanel();
}

function switchToMainPanel() {
  hideAuthenticatePanel();
  hideAddRepositoryPanel();
  displayFilePanel();
  displayGraphPanel();

  $("#nav-collapse1").collapse("hide");
  if(previousWindow == "repoPanel"){
    if(showUsername){
      document.getElementById("Button_Sign_out").style.display = "block";
      document.getElementById("Button_Sign_in").style.display="none";
    }else{
      document.getElementById("Button_Sign_out").style.display = "none";
      document.getElementById("Button_Sign_in").style.display="block";
    }
  }
  previousWindow = "mainPanel";
}

function checkSignedIn() {
  if (continuedWithoutSignIn) {
    displayModal("You need to sign in");
    // Don't open the repo modal
    $('#repo-name').removeAttr("data-target");
  } else {
    // Ensure repo modal is connected
    $('#repo-name').attr("data-target", "#repo-modal");
  }
}

function switchToAddRepositoryPanelWhenNotSignedIn() {
  previousWindow = "repoPanel";
  continuedWithoutSignIn = true;
  showUsername = false;
  switchToAddRepositoryPanel();
  
}

function switchToAddRepositoryPanel() {
  console.log("Switching to add repo panel");
  hideAuthenticatePanel();
  hideFilePanel();
  hideGraphPanel();
  displayAddRepositoryPanel();
  
  if(showUsername){
    document.getElementById("Button_Sign_out").style.display = "block";
    document.getElementById("Button_Sign_in").style.display = "none";
    displayUsername();
  }else{
    $("#nav-collapse1").collapse("hide");
    document.getElementById("Button_Sign_out").style.display = "none";
    document.getElementById("Button_Sign_in").style.display = "block";
  }
  document.getElementById("repoOpen").value = "";
  previousWindow = "repoPanel";
}

function hideSignInButton():void{
  document.getElementById("Button_Sign_in").style.display = "none";
  if(previousWindow!="repoPanel"){
    switchToMainPanel();
  }
}

function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

function displayUsername() {
  console.log("Display Username called");
  document.getElementById("Button_Sign_out").style.display = "block";
  showUsername = true;
  console.log(getUsername());
  let existing_username = document.getElementById("githubname").innerHTML;
  if (getUsername() != null && existing_username == null) {
    document.getElementById("githubname").innerHTML = getUsername();
  }
}

function displayClonePanel() {
  document.getElementById("add-repository-panel").style.zIndex = "10";
  $("#open-local-repository").hide();
}

function displayFilePanel() {
  document.getElementById("file-panel").style.zIndex = "10";
  document.getElementById("commit-message-input").style="visibility: visible";
  document.getElementById("commit-button").style="visiblity: visible";
  document.getElementById("fileEdit-button").style="visiblity: visible";
}

function displayGraphPanel() {
  document.getElementById("graph-panel").style.zIndex = "10";
}

function displayAddRepositoryPanel() {
  previousWindow = "repoPanel";
  document.getElementById("add-repository-panel").style.zIndex = "10";
  $("#open-local-repository").show();
}

function hideFilePanel() {
  document.getElementById("file-panel").style.zIndex = "-10";
  document.getElementById("commit-message-input").style="visibility: hidden";
  document.getElementById("commit-button").style="visibility: hidden";
  document.getElementById("fileEdit-button").style="visibility: hidden";
}

function hideGraphPanel() {
  document.getElementById("graph-panel").style.zIndex = "-10";
}

function hideAddRepositoryPanel() {
  document.getElementById("add-repository-panel").style.zIndex = "-10";
}

function displayDiffPanel() {
  document.getElementById("graph-panel").style.width = "60%";
  document.getElementById("diff-panel").style.width = "40%";
  displayDiffPanelButtons();
}

function hideDiffPanel() {
  document.getElementById("diff-panel").style.width = "0";
  document.getElementById("graph-panel").style.width = "100%";
  disableDiffPanelEditOnHide();
  hideDiffPanelButtons();
}

function hideDiffPanelIfNoChange() {
  let filename = document.getElementById("diff-panel-file-name") == null ? null : document.getElementById("diff-panel-file-name").innerHTML;
  let filePaths = document.getElementsByClassName('file-path');
  let nochange = true;
  for (let i = 0; i < filePaths.length; i++) {
    if (filePaths[i].innerHTML === filename) {

      nochange = false;
    }
  }
  if (nochange == true){
    hideDiffPanel();
  }
  filename = null;
}

function hideAuthenticatePanel() {
  document.getElementById("authenticate").style.zIndex = "-20";
}

function displayAuthenticatePanel() {
  document.getElementById("authenticate").style.zIndex = "20";
}

function displayDiffPanelButtons() {
  document.getElementById("save-button").style.visibility = "visible";
  document.getElementById("cancel-button").style.visibility = "visible";
}

function hideDiffPanelButtons() {
  document.getElementById("save-button").style.visibility = "hidden";
  document.getElementById("cancel-button").style.visibility = "hidden";
  disableSaveCancelButton();
  disableDiffPanelEditOnHide();
}

function disableSaveCancelButton() {
  let saveButton = document.getElementById("save-button");
  let cancelButton = document.getElementById("cancel-button");
  saveButton.disabled = true;
  saveButton.style.backgroundColor = gray;
  cancelButton.disabled = true;
  cancelButton.style.backgroundColor = gray;
}

function enableSaveCancelButton() {
  let saveButton = document.getElementById("save-button");
  let cancelButton = document.getElementById("cancel-button");
  saveButton.disabled = false;
  saveButton.style.backgroundColor = blue;
  cancelButton.disabled = false;
  cancelButton.style.backgroundColor = blue;
}

function disableDiffPanelEditOnHide() {
  let doc = document.getElementById("diff-panel-body");
  doc.contentEditable = "false";
}

function useSaved() {

  let file = 'data.json';
  // check if the data.json file exists
  fs.exists(file, (exist) => {
    if (exist) {
      console.log('button has been pressed: logging in with saved credentials');
      decrypt();
      loginWithSaved(switchToMainPanel);
    } else {
      // if data,json file doesn't exist show a pop up.
      window.alert("No saved credentials exist");
    }
  });
}
