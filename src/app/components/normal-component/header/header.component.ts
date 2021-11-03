import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { Subscription } from 'rxjs';
import { LocaleUtils } from 'src/app/utils/LocaleUtils';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
    public userName: string | null;

    private joueurSub: Subscription;

    public showMenu: boolean = false;

    public currentLanguage: string;
    public availableLanguages: string[] = ['FR', 'EN'];

    constructor(public router: Router,
                public authenticationService: AuthenticationService) {
    }
    public ngOnInit(): void {
        this.currentLanguage = LocaleUtils.getLocale().toUpperCase();
        this.joueurSub = this.authenticationService.getJoueurObs()
            .subscribe((joueur: { pseudo: string, verified: boolean}) => {
                if (joueur != null && joueur.pseudo !== '') {
                    this.userName = joueur.pseudo;
                } else {
                    this.userName = null;
                }
            });
    }
    public async logout(): Promise<void> {
        await this.authenticationService.disconnect();
        this.router.navigate(['/login']);
    }
    public changeLanguage(language: string): void {
        localStorage.setItem('locale', language.toLowerCase());
        // Reload app for selected language
        window.open(window.location.href, '_self');
    }
    public ngOnDestroy(): void {
        this.joueurSub.unsubscribe();
    }
}
