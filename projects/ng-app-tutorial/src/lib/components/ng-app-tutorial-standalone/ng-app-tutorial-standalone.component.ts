import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { NgAppTutorialComponent } from '../ng-app-tutorial/ng-app-tutorial.component';

@Component({
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: '../ng-app-tutorial/ng-app-tutorial.component.html',
    styleUrls: ['../ng-app-tutorial/ng-app-tutorial.component.scss']
})
export class NgAppTutorialStandaloneComponent extends NgAppTutorialComponent {

}
