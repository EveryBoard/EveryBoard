import { Injectable } from '@angular/core';
import { JSONValue, MGPFallible } from '@everyboard/lib';
import { GameEvent, Game } from '../domain/Game';
import { Subscription } from 'rxjs';
import { BackendService, BackendMessage } from './BackendService';
import { Debug } from '../utils/Debug';
import { Player, PlayerOrNone } from '../jscaip/Player';

export abstract class AbstractGameService {
    /** Subscribe to the game, giving callbacks that will be called upon certain events */
    public abstract subscribeTo(gameId: string,
                                gameUpdate: (game: Game) => Promise<void>,
                                gameEvent: (event: GameEvent, serverTime: number) => Promise<void>,
                                error: (reason: string) => void)
    : Promise<Subscription>;

    /** Create a game. Return the id of the created game, or an error. */
    public abstract createGame(gameName: string): Promise<MGPFallible<string>>;

    /** Perform a specific game action and asserts that it has succeeded */
    protected abstract gameAction(action: JSONValue): Promise<void>;

    /** Give the current player resignation in a game */
    public async resign(): Promise<void> {
        return this.gameAction(['Resign']);
    }

    /** Notify the timeout of a player in a game */
    public async notifyTimeout(loser: Player): Promise<void> {
        return this.gameAction(['NotifyTimeout', { timeoutedPlayer: loser.getValue() }]);
    }

    private async propose(proposition: 'TakeBack' | 'Draw' | 'Rematch'): Promise<void> {
        return this.gameAction(['Propose', { proposition }]);
    }

    private async accept(proposition: 'TakeBack' | 'Draw' | 'Rematch'): Promise<void> {
        return this.gameAction(['Accept', { proposition }]);
    }

    private async reject(proposition: 'TakeBack' | 'Draw' | 'Rematch'): Promise<void> {
        return this.gameAction(['Reject', { proposition }]);
    }

    /** Propose a draw to the opponent */
    public async proposeDraw(): Promise<void> {
        return this.propose('Draw');
    }

    /** Accept the draw request of the opponent */
    public async acceptDraw(): Promise<void> {
        return this.accept('Draw');
    }

    /** Reject a draw request from the opponent */
    public async rejectDraw(): Promise<void> {
        return this.reject('Draw');
    }

    /** Propose a rematch to the opponent */
    public async proposeRematch(): Promise<void> {
        return this.propose('Rematch');
    }

    /** Accept a rematch request from the opponent */
    public async acceptRematch(): Promise<void> {
        return this.accept('Rematch');
    }

    /** Reject a rematch request from the opponent */
    public async rejectRematch(): Promise<void> {
        return this.reject('Rematch');
    }

    /** Ask to take back one of our moves */
    public async askTakeBack(): Promise<void> {
        return this.propose('TakeBack');
    }

    /** Accept that opponent takes back a move */
    public async acceptTakeBack(): Promise<void> {
        return this.accept('TakeBack');
    }

    /** Reject that opponent takes back a move */
    public async rejectTakeBack(): Promise<void> {
        return this.reject('TakeBack');
    }

    /** Add game time to the opponent */
    public async addGameTime(): Promise<void> {
        return this.gameAction(['AddTime', { kind: 'Game' }]);
    }

    /** Add move time to the opponent */
    public async addMoveTime(): Promise<void> {
        return this.gameAction(['AddTime', { kind: 'Move' }]);
    }

    /** Play a move */
    public async addMove(move: JSONValue): Promise<void> {
        return this.gameAction(['Move', { move }]);
    }

    /** End the game after a move */
    public async endGame(winner: PlayerOrNone): Promise<void> {
        return this.gameAction(['EndGame', { winner: winner.getValue() }]);
    }

}

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class GameService extends AbstractGameService {

    public constructor(private readonly backendService: BackendService) {
        super();
    }

    public override async subscribeTo(gameId: string,
                                      gameUpdate: (game: Game) => Promise<void>,
                                      gameEvent: (event: GameEvent, serverTime: number) => Promise<void>,
                                      error: (reason: string) => void)
    : Promise<Subscription> {
        const gameUpdateSubscription: Subscription =
            this.backendService.setCallback('GameUpdate', (message: BackendMessage): void => {
                void gameUpdate(message.getArgument('game'));
            });
        const gameEventSubscription: Subscription =
            this.backendService.setCallback('GameEvent', (message: BackendMessage): void => {
                void gameEvent(message.getArgument('event'), message.getArgument('serverTime'));
            });
        const gameSubscription: Subscription = await this.backendService.subscribeToGame(gameId);
        const errorSubscription: Subscription =
            this.backendService.setCallback('Error', (message: BackendMessage): void => {
                error(message.getArgument('reason'));
            });
        return new Subscription(() => {
            gameSubscription.unsubscribe();
            gameUpdateSubscription.unsubscribe();
            gameEventSubscription.unsubscribe();
            errorSubscription.unsubscribe();
        });
    }

    public override async createGame(gameName: string): Promise<MGPFallible<string>> {
        const response: MGPFallible<BackendMessage> =
            await this.backendService.sendAndWaitForReply(['Create', { gameName }], 'GameCreated');
        if (response.isFailure()) {
            return response.toOtherFallible<string>();
        } else {
            return response.map((message: BackendMessage): string => message.getArgument('gameId'));
        }
    }

    protected override async gameAction(action: JSONValue): Promise<void> {
        return this.backendService.send(action);
    }

}
