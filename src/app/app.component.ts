import { Component } from '@angular/core';
import { faTwitter, faFacebook, faGithub, IconDefinition } from '@fortawesome/free-brands-svg-icons';

import { ErrorLoggerService } from './services/ErrorLoggerService';
import { ThemeService } from './services/ThemeService';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {

    public faTwitter: IconDefinition = faTwitter;
    public faFacebook: IconDefinition = faFacebook;
    public faGithub: IconDefinition = faGithub;

    public constructor(private readonly _themeService: ThemeService,
                       private readonly _errorLoggerService: ErrorLoggerService) {}
}
