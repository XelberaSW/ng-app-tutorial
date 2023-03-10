import { CommonModule } from '@angular/common';
import { NgModule, Optional } from '@angular/core';

import { NgAppTutorialComponent } from './components/ng-app-tutorial/ng-app-tutorial.component';
import { HelpTargetProviderService } from './services/help-target-provider.service';
import { ModuleInitHookService } from './services/module-init-hook.service';
import { NgAppTutorialService } from './services/ng-app-tutorial.service';
import { SvgRendererService } from './services/svg-renderer.service';

/**
 * Module that has all imports and definitions you will need to work with @xelberasw/ng-app-tutorial
 */
@NgModule({
    declarations: [
        NgAppTutorialComponent
    ],
    imports: [
        CommonModule,
    ],
    providers: [
        NgAppTutorialService,
        ModuleInitHookService,
        SvgRendererService,
        HelpTargetProviderService
    ]
})
export class NgAppTutorialModule {
    /**
     * @private
     */
    constructor(
        @Optional() initHookService: ModuleInitHookService
    ) {
        initHookService.setInitialized();
    }
}
