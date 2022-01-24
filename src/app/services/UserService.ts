import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDAO } from '../dao/UserDAO';
import { User, UserDocument } from '../domain/User';
import { ActiveUsersService } from './ActiveUsersService';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';

@Injectable({
    providedIn: 'root',
})
export class UserService {

    constructor(private readonly activeUsersService: ActiveUsersService,
                private readonly joueursDAO: UserDAO) {
    }

    public getActiveUsersObs(): Observable<UserDocument[]> {
        // TODO: unsubscriptions from other user services
        this.activeUsersService.startObserving();
        return this.activeUsersService.activeUsersObs;
    }
    public unSubFromActiveUsersObs(): void {
        this.activeUsersService.stopObserving();
    }
    public observeUserByUsername(username: string, callback: FirebaseCollectionObserver<User>): () => void {
        // the callback will be called on the foundUser
        return this.joueursDAO.observeUserByUsername(username, callback);
    }
}
