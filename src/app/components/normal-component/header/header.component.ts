import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { Subscription } from 'rxjs';
import { faCog, faSpinner, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { UserService } from 'src/app/services/UserService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { FocusedPart } from 'src/app/domain/User';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

    public loading: boolean = true;
    public username: MGPOptional<string> = MGPOptional.empty();

    public faCog: IconDefinition = faCog;
    public faSpinner: IconDefinition = faSpinner;

    private userSubscription: Subscription;
    private observedPartSubscription: Subscription;

    public showMenu: boolean = false;

    public observedPart: MGPOptional<FocusedPart> = MGPOptional.empty();

    constructor(public router: Router,
                public connectedUserService: ConnectedUserService,
                public userService: UserService) {
    }
    public ngOnInit(): void {
        this.userSubscription = this.connectedUserService.subscribeToUser((user: AuthUser) => {
            this.loading = false;
            if (user.username.isPresent()) {
                this.username = user.username;
            } else {
                this.username = user.email;
            }});
        this.observedPartSubscription =
            this.connectedUserService.subscribeToObservedPart((focusedPart: MGPOptional<FocusedPart>) => {
                this.observedPart = focusedPart;
            });
    }
    public async logout(): Promise<void> {
        await this.connectedUserService.disconnect();
        await this.router.navigate(['/']);
    }
    public ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.observedPartSubscription.unsubscribe();
    }
}
