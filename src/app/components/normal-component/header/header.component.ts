import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { Subscription } from 'rxjs';
import { faCog, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
    public username: string = 'connecting...';

    public faCog: IconDefinition = faCog;

    private userSub: Subscription;

    public showMenu: boolean = false;

    constructor(public router: Router,
                public authenticationService: AuthenticationService) {
    }
    public ngOnInit(): void {
        this.userSub = this.authenticationService.getUserObs()
            .subscribe((user: AuthUser) => {
                if (user.username.isPresent()) {
                    this.username = user.username.get();
                } else if (user.email.isPresent()) {
                    this.username = user.email.get();
                } else {
                    this.username = '';
                }
            });
    }
    public async logout(): Promise<void> {
        await this.authenticationService.disconnect();
        await this.router.navigate(['/']);
    }
    public ngOnDestroy(): void {
        this.userSub.unsubscribe();
    }
}
