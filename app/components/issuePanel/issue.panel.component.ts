import { Component, OnInit } from "@angular/core";

@Component({
    selector: "issue-panel",
    templateUrl: "app/components/issuePanel/issue.panel.component.html"
})

export class IssuePanelComponent implements OnInit {

    closePanel(): void {
        let panel = document.getElementById("issue-panel")!;
        panel.style.height = "0vh";
        panel.style.width = "0vw";
        panel.style.zIndex = "-10";
    }


    addIssue(name, id, onclick) {
        let ul = document.getElementById(id);
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.setAttribute("href", "#");
        a.setAttribute("class", "list-group-item");
        a.setAttribute("onclick", onclick + ";event.stopPropagation()");
        li.setAttribute("role", "presentation")
        a.appendChild(document.createTextNode(name));
        a.innerHTML = name;
        li.appendChild(a);
    }
}
