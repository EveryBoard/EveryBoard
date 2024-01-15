import { Injectable } from '@angular/core';
import { PartDAO } from '../dao/PartDAO';
import { Part } from '../domain/Part';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Debug, JSONValue } from 'src/app/utils/utils';
import { MGPOptional } from '../utils/MGPOptional';
import { Subscription } from 'rxjs';
import { MinimalUser } from '../domain/MinimalUser';
import { FirestoreTime } from '../domain/Time';
import { BackendService } from './BackendService';
import { PlayerOrNone } from '../jscaip/Player';

export interface StartingPartConfig extends Partial<Part> {
    playerZero: MinimalUser,
    playerOne: MinimalUser,
    turn: number,
    beginning?: FirestoreTime,
}

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class GameService {

    public constructor(private readonly partDAO: PartDAO,
                       private readonly backendService: BackendService)

    {
    }
    public async getGameValidity(gameId: string, gameName: string): Promise<MGPValidation> {
        const realGameName: MGPOptional<string> = await this.backendService.getGameName(gameId);
        if (realGameName.isAbsent()) {
            return MGPValidation.failure('This game does not exist');
        } else if (realGameName.get() !== gameName) {
            return MGPValidation.failure('This is the wrong game type');
        } else {
            return MGPValidation.SUCCESS;
        }
    }
    public createPartConfigRoomAndChat(gameName: string): Promise<string> {
        return this.backendService.createGame(gameName);
    }
    public deletePart(gameId: string): Promise<void> {
        return this.backendService.deleteGame(gameId);
    }
    public async acceptConfig(gameId: string): Promise<void> {
        return this.backendService.acceptConfig(gameId);
    }
    public getExistingGame(gameId: string): Promise<Part> {
        return this.backendService.getGame(gameId);
    }
    public subscribeToChanges(partId: string, callback: (part: MGPOptional<Part>) => void): Subscription {
        return this.partDAO.subscribeToChanges(partId, callback);
    }
    public async resign(gameId: string): Promise<void> {
        return this.backendService.resign(gameId);
    }
    public async notifyTimeout(gameId: string, winner: MinimalUser, loser: MinimalUser): Promise<void> {
        return this.backendService.notifyTimeout(gameId, winner, loser);
    }
    public async proposeDraw(gameId: string): Promise<void> {
        return this.backendService.proposeDraw(gameId);
    }
    public async acceptDraw(gameId: string): Promise<void> {
        return this.backendService.acceptDraw(gameId);
    }
    public async refuseDraw(gameId: string): Promise<void> {
        return this.backendService.refuseDraw(gameId);
    }
    public async proposeRematch(gameId: string): Promise<void> {
        return this.backendService.proposeRematch(gameId);
    }
    public async rejectRematch(gameId: string): Promise<void> {
        return this.backendService.rejectRematch(gameId);
    }
    public async acceptRematch(gameId: string): Promise<void> {
        return this.backendService.acceptRematch(gameId);
    }
    public async askTakeBack(gameId: string): Promise<void> {
        return this.backendService.askTakeBack(gameId);
    }
    public async acceptTakeBack(gameId: string): Promise<void> {
        return this.backendService.acceptTakeBack(gameId);
    }
    public async refuseTakeBack(gameId: string): Promise<void> {
        return this.backendService.refuseTakeBack(gameId);
    }
    public async addGlobalTime(gameId: string): Promise<void> {
        return this.backendService.addGlobalTime(gameId);
    }
    public async addTurnTime(gameId: string): Promise<void> {
        return this.backendService.addTurnTime(gameId);
    }
    public async addMove(gameId: string,
                         encodedMove: JSONValue,
                         scores: MGPOptional<readonly [number, number]>)
    : Promise<void>
    {
        return this.backendService.move(gameId, encodedMove, scores);
    }
    public async addMoveAndEndGame(gameId: string,
                                   encodedMove: JSONValue,
                                   scores: MGPOptional<readonly [number, number]>,
                                   winner: PlayerOrNone)
    : Promise<void>
    {
        return this.backendService.moveAndEnd(gameId, encodedMove, scores, winner);
    }
    public async getServerTime(): Promise<number> {
        return this.backendService.getServerTime();
    }
}
