import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDAO } from '../dao/UserDAO';
import { IUser, IUserId } from '../domain/iuser';
import { ActivesUsersService } from './ActivesUsersService';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';

@Injectable({
    providedIn: 'root',
})
export class UserService {

    constructor(private activesUsersService: ActivesUsersService,
                private joueursDao: UserDAO) {
    }

    public getActivesUsersObs(): Observable<IUserId[]> {
        // TODO: unsubscriptions from other user services
        this.activesUsersService.startObserving();
        return this.activesUsersService.activesUsersObs;
    }
    public unSubFromActivesUsersObs(): void {
        this.activesUsersService.stopObserving();
    }
    public observeUserByUsername(username: string, callback: FirebaseCollectionObserver<IUser>): () => void {
        // the callback will be called on the foundUser
        return this.joueursDao.observeUserByUsername(username, callback);
    }
}
