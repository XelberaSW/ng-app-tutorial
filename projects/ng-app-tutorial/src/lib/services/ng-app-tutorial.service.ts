import { DOCUMENT } from '@angular/common';
import { ApplicationRef, ComponentRef, Inject, Injectable, Optional, ViewContainerRef, inject } from '@angular/core';

import { NgAppTutorialStandaloneComponent } from '../components/ng-app-tutorial-standalone/ng-app-tutorial-standalone.component';
import { NgAppTutorialComponent } from '../components/ng-app-tutorial/ng-app-tutorial.component';
import { ModuleInitHookService } from './module-init-hook.service';

@Injectable({
    providedIn: 'root'
})
export class NgAppTutorialService {
    private readonly _vcr: ViewContainerRef;
    private _component: ComponentRef<NgAppTutorialComponent> | undefined;
    private readonly _supportsStandalone: boolean;

    constructor(
        app: ApplicationRef,
        @Inject(DOCUMENT) document: Document,
        private readonly _moduleInitHook: ModuleInitHookService
    ) {
        const appComponent = app.components[0];

        const version = Number.parseInt(document.querySelector('[ng-version]')?.getAttribute('ng-version')?.split('.')?.[0] ?? '0');
        this._supportsStandalone = Number.isFinite(version) && version >= 14;

        this._vcr = appComponent.injector.get(ViewContainerRef);
    }

    show(item?: string) {
        if (!this._component) {

            if (this._supportsStandalone) {
                this._component = this._vcr.createComponent(NgAppTutorialStandaloneComponent);
            }
            else {
                if (this._moduleInitHook.isInitialized) {
                    this._component = this._vcr.createComponent(NgAppTutorialComponent);
                }
                else {
                    throw new Error('NgAppTutorialModule must be imported because standalone components are not supported by you version of Angular');
                }
            }

            const instance = this._component.instance;
            const hide = instance.hide.subscribe(() => this.hide());

            this._component.onDestroy(() => {
                hide.unsubscribe();
            });
        }

        this._component.instance.setSelectedNode(item || undefined);
    }

    hide() {
        if (this._component) {
            this._component.destroy();
            this._component = undefined;
        }
    }

    next() {
        this._component?.instance?.selectNext();
    }

    prev() {
        this._component?.instance?.selectPrev();
    }
}
