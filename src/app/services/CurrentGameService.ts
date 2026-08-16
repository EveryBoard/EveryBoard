import { Injectable, OnDestroy, inject } from '@angular/core';
import { Observable, ReplaySubject, Subscription } from 'rxjs';

import { MGPMap, MGPOptional, MGPValidation } from '@everyboard/lib';

import { CurrentGame, UserRoleInPart } from '../domain/User';
import { Localized } from '../utils/LocaleUtils';

import { BackendService, BackendMessage } from './BackendService';
import { AuthUser, ConnectedUserService } from './ConnectedUserService';

export class GameActionFailure {

    public static YOU_ARE_ALREADY_PLAYING: Localized = () => $localize`You are already playing in another game.`;

    public static YOU_ARE_ALREADY_CREATING: Localized = () => $localize`You are already the creator of another game.`;

    public static YOU_ARE_ALREADY_CHOSEN_OPPONENT: Localized = () => $localize`You are already the chosen opponent in another game.`;

    public static YOU_ARE_ALREADY_CANDIDATE: Localized = () => $localize`You are already candidate in another game.`;

    public static YOU_ARE_ALREADY_OBSERVING: Localized = () => $localize`You are already observing another game.`;

    public static YOU_ALREADY_HAVE_ANOTHER_TAB: Localized = () => $localize`You already have another tab open.`;

    public static UNEXPECTED_BACKEND_ERROR(error: string): string {
        return $localize`Unexpected error from backend: ${error}`;
    }
}

export abstract class AbstractCurrentGameService {

    public static readonly roleToMessage: MGPMap<UserRoleInPart, Localized> = new MGPMap([
        { key: 'Candidate', value: GameActionFailure.YOU_ARE_ALREADY_CANDIDATE },
        { key: 'ChosenOpponent', value: GameActionFailure.YOU_ARE_ALREADY_CHOSEN_OPPONENT },
        { key: 'Creator', value: GameActionFailure.YOU_ARE_ALREADY_CREATING },
        { key: 'Player', value: GameActionFailure.YOU_ARE_ALREADY_PLAYING },
        { key: 'Observer', value: GameActionFailure.YOU_ARE_ALREADY_OBSERVING },
    ]);

    protected readonly currentGameRS: ReplaySubject<MGPOptional<CurrentGame>>;
    protected readonly currentGameObs: Observable<MGPOptional<CurrentGame>>;
    protected currentGameInitialized: boolean = false;
    protected currentGame: MGPOptional<CurrentGame> = MGPOptional.empty();

    protected constructor() {
        this.currentGameRS = new ReplaySubject<MGPOptional<CurrentGame>>(1);
        this.currentGameObs = this.currentGameRS.asObservable();
    }

    protected clearCurrentGame(): void {
        this.currentGame = MGPOptional.empty();
        this.currentGameRS.next(MGPOptional.empty());
    }

    protected changeCurrentGame(newCurrentGame: MGPOptional<CurrentGame>): void {
        this.currentGameInitialized = true;
        this.currentGame = newCurrentGame;
        this.currentGameRS.next(newCurrentGame);
    }

    public subscribeToCurrentGame(callback: (optCurrentGame: MGPOptional<CurrentGame>) => void): Subscription {
        return this.currentGameObs.subscribe(callback);
    }

    public canUserCreate(): MGPValidation {
        if (this.currentGame.isAbsent()) {
            return MGPValidation.SUCCESS;
        } else {
            const message: string = AbstractCurrentGameService.roleToMessage.get(this.currentGame.get().role).get()();
            return MGPValidation.failure(message);
        }
    }

    public canUserJoin(gameId: string, gameStarted: boolean): MGPValidation {
        if (this.currentGame.isAbsent() || this.currentGame.get().id === gameId) {
            // Users can join game if they are not in any game
            // Or they can join a game if they are already in this specific game
            return MGPValidation.SUCCESS;
        } else {
            if (gameStarted && this.currentGame.get().role === 'Observer') {
                // User is allowed to observe two different parts
                return MGPValidation.SUCCESS;
            } else {
                // If the other-part is not-started, you cannot (join it and become candidate)
                // if the other-part is started but you are active(aka: non-observer) you cannot join it
                const message: string = CurrentGameService.roleToMessage.get(this.currentGame.get().role).get()();
                return MGPValidation.failure(message);
            }
        }
    }

    public getCurrentGame(): Promise<MGPOptional<CurrentGame>> {
        // We need to make sure we have fully initialized, hence currentGameObs contains a value
        // We will get that value in the first call to the callback
        return new Promise((resolve: (result: MGPOptional<CurrentGame>) => void) => {
            // We need to initialize subscription first so that it is available within the called function
            let subscription: Subscription = new Subscription();
            subscription = this.currentGameObs.subscribe((observed: MGPOptional<CurrentGame>) => {
                resolve(observed);
                subscription.unsubscribe();
            });
        });
    }

}

@Injectable({
    providedIn: 'root',
})
export class CurrentGameService extends AbstractCurrentGameService implements OnDestroy {

    private readonly backendService: BackendService = inject(BackendService);
    private readonly connectedUserService: ConnectedUserService = inject(ConnectedUserService);

    private readonly authSubscription: Subscription;

    private currentGameSubscription: Subscription = new Subscription();
    private backendSubscription: Subscription = new Subscription();
    private userUpdateRevision: number = 0;

    public constructor() {
        super();
        this.authSubscription = this.connectedUserService.subscribeToUser(async(user: AuthUser) => {
            const revision: number = ++this.userUpdateRevision;
            await this.onUserUpdate(user, revision);
        });
    }

    private async onUserUpdate(user: AuthUser, revision: number): Promise<void> {
        if (user === AuthUser.NOT_CONNECTED || user.verified === false) { // user logged out or not yet verified
            this.currentGameSubscription.unsubscribe();
            this.backendSubscription.unsubscribe();
            this.clearCurrentGame();
        } else { // new user logged in
            // We need to subscribe to any change to the user's current game
            this.currentGameSubscription =
                this.backendService.setCallback('CurrentGameUpdate', (message: BackendMessage) => {
                    this.onCurrentGameUpdate(message.getOptionalArgument('currentGame'));
                });
            // connect after setting callback to be sure to get the first one
            const backendSubscription: Subscription = await this.backendService.connect();
            if (revision === this.userUpdateRevision) {
                this.backendSubscription = backendSubscription;
            } else {
                // Authentication may change, or the application may be destroyed,
                // while the asynchronous connection is being established. Do not
                // leave that obsolete connection alive without an owner.
                backendSubscription.unsubscribe();
            }
        }
    }

    private onCurrentGameUpdate(newCurrentGame: CurrentGame | null | undefined): void {
        // Undefined if the user had no currentGame, null if it has been removed
        const previousCurrentGame: MGPOptional<CurrentGame> = this.currentGame;
        const stayedNull: boolean =
            newCurrentGame == null && previousCurrentGame.isAbsent() && this.currentGameInitialized;
        const stayedItselfAsNonNull: boolean = newCurrentGame != null &&
                                               previousCurrentGame.equalsValue(newCurrentGame);
        const valueChanged: boolean = stayedNull === false && stayedItselfAsNonNull === false;
        if (valueChanged) {
            this.changeCurrentGame(MGPOptional.ofNullable(newCurrentGame));
        }
    }

    public ngOnDestroy(): void {
        this.userUpdateRevision++;
        this.currentGameSubscription.unsubscribe();
        this.authSubscription.unsubscribe();
        this.backendSubscription.unsubscribe();
    }
}
