import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { Subscription } from 'rxjs';
import { faCog, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { UserService } from 'src/app/services/UserService';
import { FirebaseCollectionObserver } from 'src/app/dao/FirebaseCollectionObserver';
import { User, UserDocument } from 'src/app/domain/User';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

    public username: string = 'connecting...';

    private subscriptionToLoggedUser: MGPOptional<() => void> = MGPOptional.empty();

    public faCog: IconDefinition = faCog;

    private userSub: Subscription;

    public showMenu: boolean = false;

    constructor(public router: Router,
                public authenticationService: AuthenticationService,
                public userService: UserService) {
    }
    public ngOnInit(): void {
        console.log('ngOnInit ici')
        this.userSub = this.authenticationService.getUserObs()
            .subscribe((user: AuthUser) => {
                if (user.username.isPresent()) {
                    console.log('user has a username here')
                    this.username = user.username.get();
                    this.userService.setObservedUserId(user.userId);
                    this.subscriptionToLoggedUser = MGPOptional.of(this.subscribeToLoggedUserDoc());
                } else if (user.email.isPresent()) {
                    console.log('he only has a email here')
                    this.username = user.email.get();
                } else {
                    console.log('he is no one')
                    this.username = '';
                    if (this.subscriptionToLoggedUser.isPresent()) {
                        console.log('so we unsubscire cause he was connected before')
                        this.userService.removeObservedUserId();
                        this.subscriptionToLoggedUser.get()();
                        this.subscriptionToLoggedUser = MGPOptional.empty();
                    } else {
                        console.log('and has never been connected')
                    }
                }
            });
    }
    public subscribeToLoggedUserDoc(): () => void { // TODOTODO: return something to self-unsubscribe
        const onUserCreated: (createdUser: UserDocument[]) => void = (createdUser: UserDocument[]) => {
            console.log('userCreated', createdUser);
        };
        const onUserUpdated: (updatedUser: UserDocument[]) => void = (updatedUser: UserDocument[]) => {
            console.log('updatedUser', updatedUser);
        };
        const onUserDeleted: (deletedUser: UserDocument[]) => void = (deletedUser: UserDocument[]) => {
            console.log('deletedUser', deletedUser);
        };
        const firebaseObserver: FirebaseCollectionObserver<User> = new FirebaseCollectionObserver(onUserCreated,
                                                                                                  onUserUpdated,
                                                                                                  onUserDeleted);
        return this.userService.observeUserByUsername(this.username, firebaseObserver);
        // TODOTODO on connais son id, cherche par id !
    }
    public async logout(): Promise<void> {
        await this.authenticationService.disconnect();
        await this.router.navigate(['/']);
    }
    public ngOnDestroy(): void {
        this.userSub.unsubscribe();
    }
}
