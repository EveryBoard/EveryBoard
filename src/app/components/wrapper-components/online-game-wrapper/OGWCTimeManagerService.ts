import { Injectable } from '@angular/core';
import { PartEvent, PartEventMove, PartEventRequest, PartEventReply, PartEventAction } from '../../../domain/Part';
import { CountDownComponent } from '../../normal-component/count-down/count-down.component';
import { ConfigRoom } from 'src/app/domain/ConfigRoom';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Timestamp } from 'firebase/firestore';
import { getMillisecondsElapsed } from 'src/app/utils/TimeUtils';

/**
 * The time manager manages clocks of each player.
 * There are two main scenarios to consider:
 *   1. we join at the beginning of a game, or
 *   2. we join mid-game.
 * On top of that, it is important to remember that time can be added to a player.
 */
@Injectable({
    providedIn: 'root',
})
export class OGWCTimeManagerService {

    // The turn clocks of each player
    private turnClocks: [CountDownComponent, CountDownComponent]; // Initialized by setClocks
    // The global clocks of each player
    private globalClocks: [CountDownComponent, CountDownComponent]; // Initialized by setClocks
    // All clocks managed by this time manager
    private allClocks: CountDownComponent[]; // Initialized by setClocks
    /*
     * The configRoom, which is set when starting the clocks.
     * We need it to know the maximal game and move durations.
     */
    private configRoom: MGPOptional<ConfigRoom> = MGPOptional.empty();
    // The global time taken by each player since the beginning of the part
    private readonly takenGlobalTime: [number, number] = [0, 0];
    // The global time added to each player
    private readonly extraGlobalTime: [number, number] = [0, 0];
    // The turn time available for each player. Distinct from the clocks so it stays constant within a turn
    private readonly availableTurnTime: [number, number] = [0, 0];
    // The time at which the current move started
    private lastMoveStartTimestamp: MGPOptional<Timestamp> = MGPOptional.empty();

    public setClocks(turnClocks: [CountDownComponent, CountDownComponent],
                     globalClocks: [CountDownComponent, CountDownComponent])
    : void
    {
        this.turnClocks = turnClocks;
        this.globalClocks = globalClocks;
        this.allClocks = turnClocks.concat(globalClocks);
    }
    // At the beginning of a game, set up clocks and remember when the game started
    public onGameStart(configRoom: ConfigRoom): void {
        this.configRoom = MGPOptional.of(configRoom);
        for (const player of Player.PLAYERS) {
            // We need to initialize the service's data
            // Otherwise if we go to another page and come back, the service stays alive and the data is off
            this.takenGlobalTime[player.value] = 0;
            this.extraGlobalTime[player.value] = 0;
            this.availableTurnTime[player.value] = this.getMoveDurationInMs();
            // And we setup the clocks
            this.globalClocks[player.value].setDuration(this.getPartDurationInMs());
            this.turnClocks[player.value].setDuration(this.getMoveDurationInMs());
        }
        // We want the clocks to be paused, as we will only activate the required ones
        for (const clock of this.allClocks) {
            clock.start();
            clock.pause();
        }
    }
    private getPartDurationInMs(): number {
        return this.configRoom.get().totalPartDuration * 1000;
    }
    private getMoveDurationInMs(): number {
        return this.configRoom.get().maximalMoveDuration * 1000;
    }
    public onReceivedAction(action: PartEventAction): void {
        switch (action.action) {
            case 'AddTurnTime':
                this.addTurnTime(Player.of(action.player));
                break;
            case 'AddGlobalTime':
                this.addGlobalTime(Player.of(action.player));
                break;
            case 'StartGame':
                this.lastMoveStartTimestamp = MGPOptional.of(action.time as Timestamp);
                break;
            case 'EndGame':
                this.onGameEnd();
                break;
        }
    }
    public onReceivedMove(move: PartEventMove): void {
        const player: Player = Player.of(move.player);

        const moveTimestamp: Timestamp = move.time as Timestamp;
        const takenMoveTime: number = this.getMillisecondsElapsedSinceLastMoveStart(moveTimestamp);
        this.lastMoveStartTimestamp = MGPOptional.of(moveTimestamp);
        this.takenGlobalTime[player.value] += takenMoveTime;

        this.availableTurnTime[player.value] -= takenMoveTime;

        // Now is the time to update the other player's clock
        // They may get updated through later action such as time additions
        const nextPlayer: Player = player.getOpponent();
        this.availableTurnTime[nextPlayer.value] = this.getMoveDurationInMs();
        const nextPlayerAdaptedGlobalTime: number = this.getPartDurationInMs() - this.takenGlobalTime[nextPlayer.value];
        this.globalClocks[nextPlayer.value].changeDuration(nextPlayerAdaptedGlobalTime);
    }
    private getMillisecondsElapsedSinceLastMoveStart(timestamp: Timestamp): number {
        return getMillisecondsElapsed(this.lastMoveStartTimestamp.get(), timestamp);
    }
    // Stops all clocks that are running
    public onGameEnd(): void {
        for (const clock of this.allClocks) {
            if (clock.isStarted()) {
                clock.stop();
            }
        }
        // Finally, we update the clocks to make sure we show the correct time
        this.updateClocks();
    }
    // Pauses all clocks before handling new events
    public beforeEventsBatch(gameEnd: boolean): void {
        if (gameEnd === false) {
            this.pauseAllClocks();
        }
    }
    // Continue the current player clock after receiving events
    public afterEventsBatch(gameEnd: boolean, player: Player, currentTime: Timestamp): void {
        this.updateClocks();
        if (gameEnd === false) {
            // The drift is how long has passed since the last event occurred
            // It can be only a few ms, or a much longer time in case we join mid-game
            const drift: number = this.getMillisecondsElapsedSinceLastMoveStart(currentTime);
            // We need to subtract the time to take the drift into account
            this.turnClocks[player.value].subtract(drift);
            this.globalClocks[player.value].subtract(drift);
            this.resumeClocks(player);
        }
    }
    // Resumes the clocks of player. Public for testing purposes only.
    public resumeClocks(player: Player): void {
        this.turnClocks[player.value].resume();
        this.globalClocks[player.value].resume();
    }
    // Add turn time to the opponent of a player
    private addTurnTime(player: Player): void {
        const secondsToAdd: number = 30;
        this.availableTurnTime[player.getOpponent().value] += secondsToAdd * 1000;
    }
    // Add time to the global clock of the opponent of a player
    private addGlobalTime(player: Player): void {
        const secondsToAdd: number = 5 * 60;
        this.extraGlobalTime[player.getOpponent().value] += secondsToAdd * 1000;
    }
    // Update clocks with the available time
    private updateClocks(): void {
        for (const player of Player.PLAYERS) {
            this.turnClocks[player.value].changeDuration(this.availableTurnTime[player.value]);
            const globalTime: number =
                this.getPartDurationInMs() + this.extraGlobalTime[player.value] - this.takenGlobalTime[player.value];
            this.globalClocks[player.value].changeDuration(globalTime);
        }
    }
    // Pauses all clocks that are running
    private pauseAllClocks(): void {
        for (const clock of this.allClocks) {
            if (clock.isIdle() === false) {
                clock.pause();
            }
        }
    }
}
