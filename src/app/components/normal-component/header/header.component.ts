import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
    public userName: string;

    private joueurSub: Subscription;

    constructor(public router: Router,
                public authenticationService: AuthenticationService) {
    }
    public ngOnInit(): void {
        this.joueurSub = this.authenticationService.getJoueurObs()
            .subscribe((joueur: { pseudo: string, verified: boolean}) => {
                if (joueur) this.userName = joueur.pseudo;
                else this.userName = null;
            });
    }
    public async logout(): Promise<void> {
        console.log('logging out');
        await this.authenticationService.disconnect();
        this.router.navigate(['/login']);
    }
    public ngOnDestroy(): void {
        this.joueurSub.unsubscribe();
    }
}
