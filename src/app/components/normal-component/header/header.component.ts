import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
    public userName: string;

    private joueurSub: Subscription;

    public showMenu: boolean = false;

    public currentLanguage: string;
    public availableLanguages: string[] = ['FR', 'EN'];

    constructor(public router: Router,
                public authenticationService: AuthenticationService) {
    }
    public ngOnInit(): void {
        this.currentLanguage = (localStorage.getItem('locale') || navigator.language || 'fr').slice(0, 2).toUpperCase();
        this.joueurSub = this.authenticationService.getJoueurObs()
            .subscribe((joueur: { pseudo: string, verified: boolean}) => {
                this.userName = joueur.pseudo;
            });
    }
    public async logout(): Promise<void> {
        await this.authenticationService.disconnect();
        this.router.navigate(['/login']);
    }
    public changeLanguage(language: string): void {
        localStorage.setItem('locale', language.toLowerCase());
        // Reload app for selected language
        window.open(environment.root + '/' + language.toLowerCase(), '_self');
    }
    public ngOnDestroy(): void {
        this.joueurSub.unsubscribe();
    }
}
