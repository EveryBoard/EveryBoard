import { Component, inject } from '@angular/core';
import { faTwitter, faFacebook, faGithub, IconDefinition } from '@fortawesome/free-brands-svg-icons';

import { ErrorLoggerService } from './services/ErrorLoggerService';
import { ThemeService } from './services/ThemeService';
import { HeaderComponent } from './components/normal-component/header/header.component';
import { RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [
        HeaderComponent,
        RouterOutlet,
        FaIconComponent,
    ],
})
export class AppComponent {

    private readonly _themeService: ThemeService = inject(ThemeService);
    private readonly _errorLoggerService: ErrorLoggerService = inject(ErrorLoggerService);

    public faTwitter: IconDefinition = faTwitter;
    public faFacebook: IconDefinition = faFacebook;
    public faGithub: IconDefinition = faGithub;
}
