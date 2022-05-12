import { Injectable } from '@angular/core';
import { Unsubscribe } from 'firebase/auth';
import { Observable } from 'rxjs';
import { UserDAO } from '../dao/UserDAO';
import { User, UserDocument } from '../domain/User';
import { ActiveUsersService } from './ActiveUsersService';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';
import { MGPOptional } from '../utils/MGPOptional';
import { FirebaseTime } from '../domain/Time';

/**
  * The aim of this service is to:
  *     A. subscribe to other users to see if they are online in thoses contexts:
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
        // TODO: unsubscriptions from other user services
        this.activeUsersService.startObserving();
        return this.activeUsersService.activeUsersObs;
    }
    public unSubFromActiveUsersObs(): void {
        this.activeUsersService.stopObserving();
    }
    public observeUserByUsername(username: string, callback: FirebaseCollectionObserver<User>): () => void {
        // the callback will be called on the foundUser
        return this.userDAO.observeUserByUsername(username, callback);
    }
    public observeUser(userId: string, callback: (user: MGPOptional<User>) => void): Unsubscribe {
        return this.userDAO.subscribeToChanges(userId, callback);
    }
    public async getUserLastChanged(id: string): Promise<MGPOptional<FirebaseTime>> {
        const user: MGPOptional<User> = await this.userDAO.read(id);
        if (user.isAbsent()) {
            console.log('no user to lastChange !')
            return MGPOptional.empty();
        } else {
            // TODO FOR REVIEW: rendre ça "jamais nul en db" ?
            const lastChanged: FirebaseTime | undefined = user.get().last_changed;
            if (lastChanged == null) {
                console.log('last changed was nul!')
                return MGPOptional.empty();
            } else {
                console.log('last changed was', lastChanged)
                return MGPOptional.of(lastChanged);
            }
        }
    }
}
