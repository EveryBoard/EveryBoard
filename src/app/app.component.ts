import { Component } from '@angular/core';
import { ThemeService } from './services/ThemeService';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {
    constructor(private _themeService: ThemeService) {}
}
