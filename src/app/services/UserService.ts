import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDAO } from '../dao/UserDAO';
import { IUser, IUserId } from '../domain/iuser';
import { ActiveUsersService } from './ActiveUsersService';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';

@Injectable({
    providedIn: 'root',
})
export class UserService {

    constructor(private readonly activesUsersService: ActiveUsersService,
                private readonly joueursDAO: UserDAO) {
        console.log('user service')
    }

    public getActiveUsersObs(): Observable<IUserId[]> {
        // TODO: unsubscriptions from other user services
        this.activesUsersService.startObserving();
        return this.activesUsersService.activesUsersObs;
    }
    public unSubFromActiveUsersObs(): void {
        this.activesUsersService.stopObserving();
    }
    public observeUserByUsername(username: string, callback: FirebaseCollectionObserver<IUser>): () => void {
        // the callback will be called on the foundUser
        return this.joueursDAO.observeUserByUsername(username, callback);
    }
}
