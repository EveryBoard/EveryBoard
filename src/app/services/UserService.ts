import { Injectable } from '@angular/core';
import { Unsubscribe } from 'firebase/auth';
import { Observable } from 'rxjs';
import { UserDAO } from '../dao/UserDAO';
import { User, UserDocument } from '../domain/User';
import { ActiveUsersService } from './ActiveUsersService';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';
import { assert } from '../utils/utils';
import { MGPOptional } from '../utils/MGPOptional';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    /**
     * The aim of this component is to:
     *     A. subscribe to other users to see if they are online in thoses contexts:
     *         1. The candidates when you are creator in PartCreation
     *         2. The creator when you are candidate in PartCreation
     *         3. Your opponent when you are playing
     *     B. subscribe to yourself in the header for multitab purpose
     */
    private currentUserId: MGPOptional<string> = MGPOptional.empty();

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
        // TODOTODO: make this unused
        // the callback will be called on the foundUser
        return this.userDAO.observeUserByUsername(username, callback);
    }
    public observeUser(userId: string, callback: (user: MGPOptional<User>) => void): Unsubscribe {
        return this.userDAO.subscribeToChanges(userId, callback);
    }
    public setObservedUserId(authUserId: string) {
        // TODO FOR REVIEW: on a changé un truc, il se plaint pas du non typage de la fonction !
        this.currentUserId = MGPOptional.of(authUserId);
    }
    public removeObservedUserId() {
        this.currentUserId = MGPOptional.empty();
    }
    public updateObservedPart(observedPart: string): Promise<void> {
        // TODOTOD: TEST IN ITSELF, NOT JUST TESTING ITS CALLED
        assert(this.currentUserId.isPresent(), 'Should be subscribe to yourself when connected');
        return this.userDAO.update(this.currentUserId.get(), { observedPart });
    }
    public removeObservedPart(): Promise<void> { // TODOTOD: TEST IN ITSELF, NOT JUST TESTING ITS CALLED
        assert(this.currentUserId.isPresent(), 'Should be subscribe to yourself when connected');
        return this.userDAO.update(this.currentUserId.get(), { observedPart: undefined });
    }
    public sendPresenceToken(): Promise<void> {
        assert(this.currentUserId.isPresent(), 'Should be subscribe to yourself when connected');
        return this.userDAO.updatePresenceToken(this.currentUserId.get());
    }
}
