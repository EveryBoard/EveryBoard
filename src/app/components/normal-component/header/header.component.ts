import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { Subscription } from 'rxjs';
import { faCog, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { UserService } from 'src/app/services/UserService';

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
                public connectedUserService: ConnectedUserService,
                public userService: UserService) {
    }
    public ngOnInit(): void {
        this.userSub = this.connectedUserService.getUserObs().subscribe((user: AuthUser) => {
            if (user.username.isPresent()) {
                this.username = user.username.get();
            } else {
                this.username = user.email.getOrElse('');
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
