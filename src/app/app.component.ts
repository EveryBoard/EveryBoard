import { Component } from '@angular/core';
import { DynamicCSSService } from './services/DynamicCSSService';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {
    constructor(private _dynamicCssService: DynamicCSSService) {}
}
