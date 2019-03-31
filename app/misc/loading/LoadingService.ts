import { Injectable } from '@angular/core'
import {LoadingComponent} from './loading.component';

@Injectable()
export class LoadingService{
    private loadingCache = new Set<LoadingComponent>();

    _register(loading: LoadingComponent): void {
        this.loadingCache.add(loading);
    }

    _unregister(loadingRemove: LoadingComponent): void {
        this.loadingCache.forEach(loading => {
            if (loading === loadingRemove){
                this.loadingCache.delete(loadingRemove);
            }
        })
    }

    show(loadingName: string): void {
        this.loadingCache.forEach(loading => {
            if (loading.name === loadingName) {
                loading.show = true;
            }
        });
    }


    hide(loadingName: string): void {
        this.loadingCache.forEach(loading => {
            if (loading.name === loadingName) {
                loading.show = false;
            }
        });
    }

    isShowing(loadingName: string): boolean {
        let showing = false;
        this.loadingCache.forEach(loading => {
            if (loadingName === loading.name){
                showing = loading.show;
            }
        });
        return showing;
    }
}
