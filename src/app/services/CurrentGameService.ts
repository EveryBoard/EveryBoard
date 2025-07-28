import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject, Subscription } from 'rxjs';

import { CurrentGame, UserRoleInPart } from '../domain/User';
import { MGPMap, MGPOptional, MGPValidation } from '@everyboard/lib';
import { AuthUser, ConnectedUserService, GameActionFailure } from './ConnectedUserService';
import { Localized } from '../utils/LocaleUtils';
import { BackendService, BackendMessage, AbstractBackendService } from './BackendService';

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

    private readonly authSubscription: Subscription;

    private currentGameSubscription: Subscription = new Subscription();

    public constructor(private readonly backendService: BackendService,
                       private readonly connectedUserService: ConnectedUserService)
    {
        super();
        this.authSubscription = this.connectedUserService.subscribeToUser(async(user: AuthUser) => {
            await this.onUserUpdate(user);
        });
    }

    private async onUserUpdate(user: AuthUser): Promise<void> {
        if (user === AuthUser.NOT_CONNECTED || user.verified === false) { // user logged out or not yet verified
            this.currentGameSubscription.unsubscribe();
            this.clearCurrentGame();
        } else { // new user logged in
            // We need to subscribe to any change to the user's current game
            console.log('subscribing!!!')
            this.currentGameSubscription =
                this.backendService.setCallback('CurrentGameUpdate', (message: BackendMessage) => {
                    this.onCurrentGameUpdate(message.getOptionalArgument('currentGame'));
                });
            console.log('the value is: ' + JSON.stringify(this.currentGameSubscription))
            // connect after setting callback to be sure to get the first one
            await this.backendService.connect();
        }
    }

    private onCurrentGameUpdate(newCurrentGame: CurrentGame | null | undefined): void {
        // Undefined if the user had no currentGame, null if it has been removed
        const previousCurrentGame: MGPOptional<CurrentGame> = this.currentGame;
        const stayedNull: boolean = newCurrentGame == null && previousCurrentGame.isAbsent();
        const stayedItselfAsNonNull: boolean = newCurrentGame != null &&
                                               previousCurrentGame.equalsValue(newCurrentGame);
        const valueChanged: boolean = stayedNull === false && stayedItselfAsNonNull === false;
        if (valueChanged) {
            this.changeCurrentGame(MGPOptional.ofNullable(newCurrentGame));
        }
    }

    public ngOnDestroy(): void {
        console.log('unsubscribing')
        this.currentGameSubscription.unsubscribe();
        this.authSubscription.unsubscribe();
        console.log('done unsubscribing')
    }
}
