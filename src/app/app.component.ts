import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faDiscord, faFacebook, faGithub, IconDefinition } from '@fortawesome/free-brands-svg-icons';

import { HeaderComponent } from './components/normal-component/header/header.component';
import { ErrorLoggerService } from './services/ErrorLoggerService';
import { ThemeService } from './services/ThemeService';

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

    public faDiscord: IconDefinition = faDiscord;
    public faFacebook: IconDefinition = faFacebook;
    public faGithub: IconDefinition = faGithub;
}
