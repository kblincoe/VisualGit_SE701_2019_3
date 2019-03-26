function addCommand(command) {
  let gitCommand = document.createElement("p");
  gitCommand.className = "git-command";
  gitCommand.id = "git-command";
  gitCommand.innerHTML = command;
  let footer = document.getElementById("footer");
  if (footer != null) {
    footer.appendChild(gitCommand);
    footer.scrollTop = footer.scrollHeight;
  }
}
