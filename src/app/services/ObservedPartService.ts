import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject, Subscription } from 'rxjs';

import { FocusedPart, User, UserRoleInPart } from '../domain/User';
import { MGPOptional } from '../utils/MGPOptional';
import { UserDAO } from '../dao/UserDAO';
import { AuthUser, ConnectedUserService, GameActionFailure } from './ConnectedUserService';
import { MGPValidation } from '../utils/MGPValidation';
import { assert } from '../utils/assert';
import { MGPMap } from '../utils/MGPMap';
import { Localized } from '../utils/LocaleUtils';
import { UserService } from './UserService';

@Injectable({
    providedIn: 'root',
})
export class ObservedPartService implements OnDestroy {

    public static roleToMessage: MGPMap<UserRoleInPart, Localized> = new MGPMap([
        { key: 'Candidate', value: GameActionFailure.YOU_ARE_ALREADY_CANDIDATE },
        { key: 'ChosenOpponent', value: GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT },
        { key: 'Creator', value: GameActionFailure.YOU_ARE_ALREADY_CREATING },
        { key: 'Player', value: GameActionFailure.YOU_ARE_ALREADY_PLAYING },
        { key: 'Observer', value: GameActionFailure.YOU_ARE_ALREADY_OBSERVING },
    ]);
    private readonly authSubscription: Subscription;

    private userSubscription: Subscription = new Subscription();

    private observedPartLoading: boolean = true;
    private observedPart: MGPOptional<FocusedPart> = MGPOptional.empty();
    private readonly observedPartRS: ReplaySubject<MGPOptional<FocusedPart>>;
    private readonly observedPartObs: Observable<MGPOptional<FocusedPart>>;

    public constructor(private readonly userDAO: UserDAO,
                       private readonly userService: UserService,
                       private readonly connectedUserService: ConnectedUserService)
    {
        this.observedPartRS = new ReplaySubject<MGPOptional<FocusedPart>>(1);
        this.observedPartObs = this.observedPartRS.asObservable();
        this.authSubscription = this.connectedUserService.subscribeToUser((user: AuthUser) => {
            this.onUserUpdate(user);
        });
    }
    private async onUserUpdate(user: AuthUser): Promise<void> {
        if (user === AuthUser.NOT_CONNECTED) { // user logged out
            this.userSubscription.unsubscribe();
            this.observedPartRS.next(MGPOptional.empty());
        } else { // new user logged in
            console.log('user logged in')
            // First we need to get the current observed part
            const observedPart: MGPOptional<User> = await this.userDAO.read(user.id);
            console.log('observed part is: ' + observedPart.get().observedPart)
            this.onObservedPartUpdate(observedPart.get().observedPart)
            // And then we subscribe to any change to the user's observed part
            this.userSubscription =
                this.userService.observeUserOnServer(user.id, (docOpt: MGPOptional<User>) => {
                    assert(docOpt.isPresent(), 'Observing part service expected user to already have a document!');
                    const doc: User = docOpt.get();
                    this.onObservedPartUpdate(doc.observedPart);
                });
        }
    }
    private onObservedPartUpdate(newObservedPart: FocusedPart | null | undefined): void {
        // Undefined if the user had no observedPart, null if it has been removed
        const previousObservedPart: MGPOptional<FocusedPart> = this.observedPart;
        const stayedNull: boolean = newObservedPart == null && previousObservedPart.isAbsent();
        const stayedItselfAsNonNull: boolean = newObservedPart != null &&
                                               previousObservedPart.equalsValue(newObservedPart);
        const valueChanged: boolean = stayedNull === false && stayedItselfAsNonNull === false;
        console.log({valueChanged, stayedNull, stayedItselfAsNonNull})
        if (valueChanged || this.observedPartLoading) {
            // this.observedPartLoading = false;
            this.observedPart = MGPOptional.ofNullable(newObservedPart);
            this.observedPartRS.next(this.observedPart);
        }
    }
    public updateObservedPart(observedPart: Partial<FocusedPart>): Promise<void> {
        assert(this.connectedUserService.user.isPresent(), 'Should not call updateObservedPart when not connected');
        if (this.observedPart.isPresent()) {
            const oldObservedPart: FocusedPart = this.observedPart.get();
            const mergedObservedPart: FocusedPart = { ...oldObservedPart, ...observedPart };
            return this.userDAO.update(this.connectedUserService.user.get().id, { observedPart: mergedObservedPart });
        } else {
            const fakeFocusedPart: FocusedPart = {
                id: 'id',
                role: 'Candidate',
                typeGame: 'P4',
            };
            const keys: string[] = Object.keys(fakeFocusedPart);
            for (const key of keys) {
                assert(observedPart[key] != null, 'field ' + key + ' should be set before updating observedPart');
            }
            // Here, we know that observedPart is not partial
            return this.userDAO.update(this.connectedUserService.user.get().id, { observedPart });
        }
    }
    public removeObservedPart(): Promise<void> {
        assert(this.connectedUserService.user.isPresent(), 'Should not call removeObservedPart when not connected');
        console.log('REMOVING')
        return this.userDAO.update(this.connectedUserService.user.get().id, { observedPart: null });
    }
    public subscribeToObservedPart(callback: (optFocusedPart: MGPOptional<FocusedPart>) => void): Subscription {
        return this.observedPartObs.subscribe(callback);
    }
    public canUserCreate(): MGPValidation {
        if (this.observedPart.isAbsent()) {
            console.log('canCreate: YES')
            return MGPValidation.SUCCESS;
        } else {
            console.log('canCreate: NO')
            const message: string = ObservedPartService.roleToMessage.get(this.observedPart.get().role).get()();
            return MGPValidation.failure(message);
        }
    }
    public canUserJoin(partId: string, gameStarted: boolean): MGPValidation {
        if (this.observedPart.isAbsent() || this.observedPart.get().id === partId) {
            // Users can join game if they are not in any game
            // Or they can join a game if they are already in this specific game
            return MGPValidation.SUCCESS;
        } else {
            if (gameStarted && this.observedPart.get().role === 'Observer') {
                // User is allowed to observe two different parts
                return MGPValidation.SUCCESS;
            } else {
                // If the other-part is not-started, you cannot (join it and become candidate)
                // if the other-part is started but you are active(aka: non-observer) you cannot join it
                const message: string = ObservedPartService.roleToMessage.get(this.observedPart.get().role).get()();
                return MGPValidation.failure(message);
            }
        }
    }
    public ngOnDestroy(): void {
        this.userSubscription.unsubscribe();
        this.authSubscription.unsubscribe();
    }
}
