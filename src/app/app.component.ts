import { Component } from '@angular/core';
import { ErrorLoggerService } from './services/ErrorLogger';
import { ThemeService } from './services/ThemeService';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {
    constructor(private readonly _themeService: ThemeService,
                private readonly _errorLoggerService: ErrorLoggerService) {}
}
