import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { Subscription } from 'rxjs';
import { faCog, faSpinner, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { UserService } from 'src/app/services/UserService';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

    public loading: boolean = true;
    public username: MGPOptional<string> = MGPOptional.empty();

    public faCog: IconDefinition = faCog;
    public faSpinner: IconDefinition = faSpinner;

    private userSub: Subscription;

    public showMenu: boolean = false;

    constructor(public router: Router,
                public connectedUserService: ConnectedUserService,
                public userService: UserService) {
    }
    public ngOnInit(): void {
        this.userSub = this.connectedUserService.subscribeToUser((user: AuthUser) => {
            this.loading = false;
            if (user.username.isPresent()) {
                this.username = user.username;
            } else {
                this.username = user.email;
            }});
    }
    public async logout(): Promise<void> {
        await this.connectedUserService.disconnect();
        await this.router.navigate(['/']);
    }
    public ngOnDestroy(): void {
        this.userSub.unsubscribe();
    }
}
