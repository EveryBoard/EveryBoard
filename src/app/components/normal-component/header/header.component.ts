import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { Subscription } from 'rxjs';
import { faCog, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { UserService } from 'src/app/services/UserService';
import { User } from 'src/app/domain/User';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

    public username: string = 'connecting...';
    private userId: string;

    private subscriptionToLoggedUser: MGPOptional<() => void> = MGPOptional.empty();

    public faCog: IconDefinition = faCog;

    private userSub: Subscription;

    public showMenu: boolean = false;

    constructor(public router: Router,
                public authenticationService: AuthenticationService,
                public userService: UserService) {
    }
    public ngOnInit(): void {
        this.userSub = this.authenticationService.getUserObs()
            .subscribe((user: AuthUser) => {
                if (user.username.isPresent()) {
                    this.username = user.username.get();
                    this.userId = user.userId;
                    this.userService.setObservedUserId(user.userId);
                    this.subscriptionToLoggedUser = MGPOptional.of(this.subscribeToLoggedUserDoc());
                } else if (user.email.isPresent()) {
                    this.username = user.email.get();
                } else {
                    this.username = '';
                    if (this.subscriptionToLoggedUser.isPresent()) {
                        this.userService.removeObservedUserId();
                        this.subscriptionToLoggedUser.get()();
                        this.subscriptionToLoggedUser = MGPOptional.empty();
                    }
                }
            });
    }
    public subscribeToLoggedUserDoc(): () => void {
        const subscription: () => void = this.userService.observeUser(this.userId, (user: MGPOptional<User>) => {
            console.log('reçu puté', user);
        });
        return subscription;
    }
    public async logout(): Promise<void> {
        await this.authenticationService.disconnect();
        await this.router.navigate(['/']);
    }
    public ngOnDestroy(): void {
        this.userSub.unsubscribe();
    }
}
