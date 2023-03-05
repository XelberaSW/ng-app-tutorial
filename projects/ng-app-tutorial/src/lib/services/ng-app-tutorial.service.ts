import { DOCUMENT } from '@angular/common';
import { ApplicationRef, ComponentRef, Inject, Injectable, Optional, ViewContainerRef, inject } from '@angular/core';

import { NgAppTutorialStandaloneComponent } from '../components/ng-app-tutorial-standalone/ng-app-tutorial-standalone.component';
import { NgAppTutorialComponent } from '../components/ng-app-tutorial/ng-app-tutorial.component';
import { ModuleInitHookService } from './module-init-hook.service';

/**
 * Entry point for tutorial API
 */
@Injectable({
    providedIn: 'root'
})
export class NgAppTutorialService {
    /** @private */
    private readonly _vcr: ViewContainerRef;
    /** @private */
    private _component: ComponentRef<NgAppTutorialComponent> | undefined;
    /** @private */
    private readonly _supportsStandalone: boolean;

    /**
     * @private
     */
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

    /**
     * Show tutorial UI
     */
    show(): void
    /**
     * Show tutorial UI and select specific element at start.
     * If slement with this is is not available, default one will be selected.
     * @param itemId Unique identifier of item to be selected
     */
    show(itemId: string): void;
    /**
     * @private
     */
    show(item?: string): void {
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

    /**
     * Hide tutorial UI
     */
    hide() {
        if (this._component) {
            this._component.destroy();
            this._component = undefined;
        }
    }

    /**
     * Select next item
     */
    next() {
        this._component?.instance?.selectNext();
    }

    /**
     * Select previous item
     */
    prev() {
        this._component?.instance?.selectPrev();
    }
}
