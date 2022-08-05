import { Injectable } from '@angular/core';
import { Unsubscribe } from 'firebase/auth';
import { Observable } from 'rxjs';
import { UserDAO } from '../dao/UserDAO';
import { User, UserDocument } from '../domain/User';
import { ActiveUsersService } from './ActiveUsersService';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { MGPOptional } from '../utils/MGPOptional';
import { FirestoreTime } from '../domain/Time';
import { assert } from '../utils/assert';

/**
  * The aim of this service is to:
  *     A. subscribe to other users to see if they are online in those contexts:
  *         1. The candidates when you are creator in PartCreation
  *         2. The creator when you are candidate in PartCreation
  *         3. Your opponent when you are playing
  *     B. subscribe to yourself in the header for multitab purpose
  */
@Injectable({
    providedIn: 'root',
})
export class UserService {

    constructor(private readonly activeUsersService: ActiveUsersService,
                private readonly userDAO: UserDAO) {
    }
    public getActiveUsersObs(): Observable<UserDocument[]> {
        this.activeUsersService.startObserving();
        return this.activeUsersService.activeUsersObs;
    }
    public unSubFromActiveUsersObs(): void {
        this.activeUsersService.stopObserving();
    }
    public observeUserByUsername(username: string, callback: FirestoreCollectionObserver<User>): () => void {
        // the callback will be called on the foundUser
        return this.userDAO.observeUserByUsername(username, callback);
    }
    public observeUser(userId: string, callback: (user: MGPOptional<User>) => void): Unsubscribe {
        return this.userDAO.subscribeToChanges(userId, callback);
    }
    public async getUserLastUpdateTime(id: string): Promise<MGPOptional<FirestoreTime>> {
        const user: MGPOptional<User> = await this.userDAO.read(id);
        if (user.isAbsent()) {
            return MGPOptional.empty();
        } else {
            const lastUpdateTime: FirestoreTime | undefined = user.get().lastUpdateTime;
            assert(lastUpdateTime != null, 'should not receive a lastUpdateTime equal to null');
            return MGPOptional.of(lastUpdateTime as FirestoreTime);
        }
    }
}
