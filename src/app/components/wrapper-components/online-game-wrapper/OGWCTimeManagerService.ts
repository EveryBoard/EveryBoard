import { Injectable } from '@angular/core';

import { MGPOptional, Utils } from '@everyboard/lib';

import { ConfigRoom } from '../../../domain/ConfigRoom';
import { GameEventMove, GameEventAction, Game } from '../../../domain/Game';
import { MinimalUser } from '../../../domain/MinimalUser';
import { Player } from '../../../jscaip/Player';
import { PlayerMap, PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { TimerComponent } from '../../normal-component/timer/timer.component';

/**
 * The time manager manages timers of each player.
 * There are two main scenarios to consider:
 *   1. we join at the beginning of a game, or
 *   2. we join mid-game.
 * On top of that, it is important to remember that time can be added to a player.
 */
@Injectable()
export class OGWCTimeManagerService {

    // The move timers of each player
    private moveTimers: [TimerComponent, TimerComponent]; // Initialized by setTimers
    // The game timers of each player
    private gameTimers: [TimerComponent, TimerComponent]; // Initialized by setTimers
    // All timers managed by this time manager
    private allTimers: TimerComponent[]; // Initialized by setTimers
    // The configRoom, which is set when starting the game. We need it to know the maximal game and move durations.
    private configRoom: MGPOptional<ConfigRoom> = MGPOptional.empty();

    // The players, as we need to map between minimal users and player values
    private players: PlayerMap<MGPOptional<MinimalUser>> = PlayerMap.ofValues(MGPOptional.empty(), MGPOptional.empty());
    // The game time taken by each player since the beginning of the part
    private readonly takenGameTime: PlayerNumberMap = PlayerNumberMap.of(0, 0);

    // The game time added to each player
    private readonly extraGameTime: PlayerNumberMap = PlayerNumberMap.of(0, 0);

    // The move time available for each player. Distinct from the timers so it stays constant within a move
    private readonly availableMoveTime: PlayerNumberMap = PlayerNumberMap.of(0, 0);

    // The time at which the current move started
    private lastMoveStart: MGPOptional<number> = MGPOptional.empty();

    // Whether we are synchronized with the server, i.e., we received all events of the past
    private synchronized: boolean = false;

    // Whether the game is finished
    private gameEnd: boolean = false;

    public setTimers(moveTimers: [TimerComponent, TimerComponent],
                     gameTimers: [TimerComponent, TimerComponent])
    : void
    {
        this.moveTimers = moveTimers;
        this.gameTimers = gameTimers;
        this.allTimers = moveTimers.concat(gameTimers);
    }

    // At the beginning of a game, set up timers and remember when the game started
    public onGameStart(configRoom: ConfigRoom, game: Game, players: PlayerMap<MGPOptional<MinimalUser>>): void {
        this.configRoom = MGPOptional.of(configRoom);
        this.players = players;
        this.lastMoveStart = MGPOptional.of(game.beginning);
        this.gameEnd = false;
        for (const player of Player.PLAYERS) {
            // We need to initialize the service's data
            // Otherwise if we go to another page and come back, the service stays alive and the data is off
            this.takenGameTime.put(player, 0);
            this.extraGameTime.put(player, 0);
            this.availableMoveTime.put(player, this.getMoveDuration());
            // And we setup the timers
            this.gameTimers[player.getValue()].setDuration(this.getGameDuration());
            this.moveTimers[player.getValue()].setDuration(this.getMoveDuration());
        }
        // We want the timers to be paused, as we will only activate the required ones
        for (const timer of this.allTimers) {
            timer.start();
            timer.pause();
        }
    }

    private getGameDuration(): number {
        return this.configRoom.get().gameDuration;
    }

    private getMoveDuration(): number {
        return this.configRoom.get().moveDuration;
    }

    public onReceivedAction(action: GameEventAction): void {
        switch (action.action) {
            case 'AddMoveTime':
                this.addMoveTime(this.playerOfMinimalUser(action.user));
                break;
            case 'AddGameTime':
                this.addGameTime(this.playerOfMinimalUser(action.user));
                break;
            case 'EndGame':
                this.onGameEnd();
                break;
            case 'StartGame':
                // We will be notified from OGWC about this one, with extra information
                break;
            default:
                Utils.expectToBe(action.action, 'Sync');
                this.onSync();
                break;
        }
    }

    public playerOfMinimalUser(user: MinimalUser): Player {
        if (this.isUser(Player.ZERO, user)) {
            return Player.ZERO;
        } else {
            Utils.assert(this.isUser(Player.ONE, user), 'MinimalUser should match a player');
            return Player.ONE;
        }
    }

    private isUser(player: Player, user: MinimalUser): boolean {
        return this.players.get(player).map((candidate: MinimalUser): string => candidate.id).equalsValue(user.id);
    }

    public onReceivedMove(move: GameEventMove): void {
        const player: Player = this.playerOfMinimalUser(move.user);

        const moveTime: number = move.timestamp;
        const takenMoveTime: number = this.getSecondsElapsedSinceLastMoveStart(moveTime);
        this.lastMoveStart = MGPOptional.of(moveTime);
        this.takenGameTime.add(player, takenMoveTime);
        this.availableMoveTime.subtract(player, takenMoveTime);

        // Now is the time to update the other player's timer
        // They may get updated through later action such as time additions
        const nextPlayer: Player = player.getOpponent();
        this.availableMoveTime.put(nextPlayer, this.getMoveDuration());
        const nextPlayerTakenGameTime: number = this.takenGameTime.get(nextPlayer);
        const nextPlayerAdaptedGameTime: number = this.getGameDuration() - nextPlayerTakenGameTime;
        this.gameTimers[nextPlayer.getValue()].changeDuration(nextPlayerAdaptedGameTime);
    }

    private getSecondsElapsedSinceLastMoveStart(currentTime: number): number {
        return currentTime - this.lastMoveStart.get();
    }

    // Stops all timers that are running
    private onGameEnd(): void {
        this.gameEnd = true;
        for (const timer of this.allTimers) {
            if (timer.isStarted()) {
                timer.stop();
            }
        }
        // Finally, we update the timers to make sure we show the correct time
        this.updateTimers();
    }

    // Called when we are becoming in sync with the server
    public onSync(): void {
        this.synchronized = true;
    }

    // Pause all timers before receiving events
    public beforeEvent(): void {
        this.pauseAllTimers();
    }

    // Continue the current player timer after receiving events
    public afterEvent(currentPlayer: Player, currentTime: number): void {
        if (this.synchronized === false) {
            // We'll wait until we are synchronized to do anything
            return;
        }
        this.updateTimers();
        if (this.gameEnd === false) {
            // The drift is how long has passed since the last event occurred
            // It can be only a few ms, or a much longer time in case we join mid-game
            const drift: number = this.getSecondsElapsedSinceLastMoveStart(currentTime);
            // We need to subtract the time to take the drift into account
            this.moveTimers[currentPlayer.getValue()].subtract(drift);
            this.gameTimers[currentPlayer.getValue()].subtract(drift);
            this.resumeTimers(currentPlayer);
        }
    }

    // Resumes the timers of player. Public for testing purposes only.
    public resumeTimers(player: Player): void {
        this.moveTimers[player.getValue()].resume();
        this.gameTimers[player.getValue()].resume();
    }

    // Add move time to the opponent of a player
    private addMoveTime(player: Player): void {
        const secondsToAdd: number = 30;
        this.availableMoveTime.add(player.getOpponent(), secondsToAdd);
    }

    // Add time to the game timer of the opponent of a player
    private addGameTime(player: Player): void {
        const secondsToAdd: number = 5 * 60;
        this.extraGameTime.add(player.getOpponent(), secondsToAdd);
    }

    // Update timers with the available time
    private updateTimers(): void {
        for (const player of Player.PLAYERS) {
            this.moveTimers[player.getValue()].changeDuration(this.availableMoveTime.get(player));
            const playerTakenGameTime: number = this.takenGameTime.get(player);
            const gameTime: number =
                this.getGameDuration() + this.extraGameTime.get(player) - playerTakenGameTime;
            this.gameTimers[player.getValue()].changeDuration(gameTime);
        }
    }

    // Pauses all timers that are running
    private pauseAllTimers(): void {
        for (const timer of this.allTimers) {
            if (timer.isIdle() === false) {
                timer.pause();
            }
        }
    }
}
