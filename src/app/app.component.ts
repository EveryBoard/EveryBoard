import { Component } from '@angular/core';
import { ErrorLoggerService } from './services/ErrorLoggerService';
import { Theme, ThemeService } from './services/ThemeService';
import { faTwitter, faFacebook, faGithub, IconDefinition } from '@fortawesome/free-brands-svg-icons';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {

    public faTwitter: IconDefinition = faTwitter;
    public faFacebook: IconDefinition = faFacebook;
    public faGithub: IconDefinition = faGithub;

    public constructor(private readonly themeService: ThemeService,
                       private readonly _errorLoggerService: ErrorLoggerService) {}

    public getTheme(): Theme {
        return this.themeService.getTheme();
    }
}
