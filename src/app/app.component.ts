import { Component, inject } from '@angular/core';
import { faTwitter, faFacebook, faGithub, IconDefinition } from '@fortawesome/free-brands-svg-icons';

import { ErrorLoggerService } from './services/ErrorLoggerService';
import { ThemeService } from './services/ThemeService';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false,
})
export class AppComponent {
    private readonly _themeService = inject(ThemeService);
    private readonly _errorLoggerService = inject(ErrorLoggerService);


    public faTwitter: IconDefinition = faTwitter;
    public faFacebook: IconDefinition = faFacebook;
    public faGithub: IconDefinition = faGithub;
}
