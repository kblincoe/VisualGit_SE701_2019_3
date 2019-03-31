import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {LoadingService} from "./LoadingService";

@Component({
    selector: "loading",
    templateUrl: './loading.html'
})
export class LoadingComponent implements OnInit, OnDestroy{
    @Input() loadingImage: string;
    @Input() show = false;
    @Input() name: string;

    constructor(private loadingService: LoadingService) {}

    ngOnInit(): void {
        if (!this.loadingImage) throw new Error("Loading requires a loadingImage");
        if (!this.name) throw new Error ("Loading requires a name");

        this.loadingService._register(this);
    }

    ngOnDestroy(): void {
        this.loadingService._unregister(this);
    }
}
