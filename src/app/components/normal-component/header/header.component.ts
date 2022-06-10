import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectedUserService, AuthUser } from 'src/app/services/ConnectedUserService';
import { Subscription } from 'rxjs';
import { faCog, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { UserService } from 'src/app/services/UserService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ObservedPart } from 'src/app/domain/User';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

    public username: string = 'connecting...';

    public faCog: IconDefinition = faCog;

    private userSub: Subscription;
    private observedPartSub: Subscription;

    public showMenu: boolean = false;

    public observedPart: MGPOptional<ObservedPart> = MGPOptional.empty();

    constructor(public router: Router,
                public connectedUserService: ConnectedUserService,
                public userService: UserService) {
    }
    public ngOnInit(): void {
        console.log('let us initialise!')
        this.userSub = this.connectedUserService.getUserObs().subscribe((user: AuthUser) => {
            if (user.username.isPresent()) {
                this.username = user.username.get();
            } else {
                this.username = user.email.getOrElse('');
            }});
        this.observedPartSub =
            this.connectedUserService.getObservedPartObs().subscribe((opo: MGPOptional<ObservedPart>) => {
                console.log(opo)
                this.observedPart = opo;
            });
    }
    public async logout(): Promise<void> {
        await this.connectedUserService.disconnect();
        await this.router.navigate(['/']);
    }
    public ngOnDestroy(): void {
        this.userSub.unsubscribe();
        this.observedPartSub.unsubscribe();
    }
}
