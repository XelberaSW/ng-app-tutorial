import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ModuleInitHookService {
    private _isInitialized = false;

    setInitialized() {
        this._isInitialized = true;
    }

    get isInitialized() {
        return this._isInitialized;
    }
}
