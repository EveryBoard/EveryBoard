import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from 'src/app/services/authentication/AuthenticationService';
import {IJoueurId, IJoueur} from 'src/app/domain/iuser';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
    public userName: string;

    private joueurSub: Subscription;

    constructor(private router: Router,
                private authenticationService: AuthenticationService) {
    }
    public ngOnInit() {
        this.joueurSub = this.authenticationService.getJoueurObs()
            .subscribe((joueur) => {
                if (joueur) this.userName = joueur.pseudo;
                else this.userName = null;
            });
    }
    public backToServer() {
        this.router.navigate(['/server']);
    }
    public async logout() {
        await this.authenticationService.disconnect();
        this.router.navigate(['/login']);
    }
    public ngOnDestroy() {
        this.joueurSub.unsubscribe();
    }
}
