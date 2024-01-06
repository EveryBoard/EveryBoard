import { Injectable } from '@angular/core';
import { PartDAO } from '../dao/PartDAO';
import { MGPResult, Part, PartDocument } from '../domain/Part';
import { FirstPlayer, ConfigRoom, PartStatus } from '../domain/ConfigRoom';
import { ConfigRoomService } from './ConfigRoomService';
import { ChatService } from './ChatService';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Debug, JSONValue, Utils } from 'src/app/utils/utils';
import { MGPOptional } from '../utils/MGPOptional';
import { Subscription } from 'rxjs';
import { serverTimestamp } from 'firebase/firestore';
import { MinimalUser } from '../domain/MinimalUser';
import { ConnectedUserService } from './ConnectedUserService';
import { FirestoreTime } from '../domain/Time';
import { GameEventService } from './GameEventService';
import { BackendService } from './BackendService';

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
                       private readonly gameEventService: GameEventService,
                       private readonly connectedUserService: ConnectedUserService,
                       private readonly configRoomService: ConfigRoomService,
                       private readonly chatService: ChatService,
                       private readonly backendService: BackendService)

    {
    }
    private async update(id: string, update: Partial<Part>): Promise<void> {
        return this.partDAO.update(id, update);
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
    private createChat(chatId: string): Promise<void> {
        return this.chatService.createNewChat(chatId);
    }
    public createPartConfigRoomAndChat(gameName: string): Promise<string> {
        return this.backendService.createGame(gameName);
    }
    public getStartingConfig(configRoom: ConfigRoom): StartingPartConfig {
        let whoStarts: FirstPlayer = FirstPlayer.of(configRoom.firstPlayer);
        if (whoStarts === FirstPlayer.RANDOM) {
            if (Math.random() < 0.5) {
                whoStarts = FirstPlayer.CREATOR;
            } else {
                whoStarts = FirstPlayer.CHOSEN_PLAYER;
            }
        }
        let playerZero: MinimalUser;
        let playerOne: MinimalUser;
        if (whoStarts === FirstPlayer.CREATOR) {
            playerZero = configRoom.creator;
            playerOne = Utils.getNonNullable(configRoom.chosenOpponent);
        } else {
            playerZero = Utils.getNonNullable(configRoom.chosenOpponent);
            playerOne = configRoom.creator;
        }
        return {
            playerZero,
            playerOne,
            turn: 0,
            beginning: serverTimestamp(),
        };
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
    private async preparePartUpdate(partId: string,
                                    scores: MGPOptional<readonly [number, number]>)
    : Promise<Partial<Part>>
    {
        const part: Part = (await this.partDAO.read(partId)).get();
        const turn: number = part.turn + 1;
        let update: Partial<Part> = {
            turn,
        };
        update = this.updateScore(update, scores);
        return update;
    }
    public async updatePart(partId: string, scores: MGPOptional<readonly [number, number]>): Promise<void> {
        // TODO: this is only used to update the scores
        const update: Partial<Part> = await this.preparePartUpdate(partId, scores);
        await this.update(partId, update);
    }
    public async drawPart(partId: string, player: Player,
                          scores: MGPOptional<readonly [number, number]>)
    : Promise<void>
    {
        let update: Partial<Part> = await this.preparePartUpdate(partId, scores);
        update = {
            ...update,
            result: MGPResult.HARD_DRAW.value,
        };
        await this.update(partId, update);
        await this.gameEventService.addAction(partId, player, 'EndGame');
    }
    public async endPartWithVictory(partId: string,
                                    player: Player,
                                    winner: MinimalUser,
                                    loser: MinimalUser,
                                    scores: MGPOptional<readonly [number, number]>)
    : Promise<void>
    {
        let update: Partial<Part> = await this.preparePartUpdate(partId, scores);
        update = {
            ...update,
            winner,
            loser,
            result: MGPResult.VICTORY.value,
        };
        await this.update(partId, update);
        await this.gameEventService.addAction(partId, player, 'EndGame');
    }
    public async addMove(partId: string, player: Player, encodedMove: JSONValue): Promise<void> {
        await this.gameEventService.addMove(partId, player, encodedMove);
    }
    private updateScore(update: Partial<Part>, scores: MGPOptional<readonly [number, number]>): Partial<Part> {
        if (scores.isPresent()) {
            return {
                ...update,
                scorePlayerZero: scores.get()[0],
                scorePlayerOne: scores.get()[1],
            };
        }
        return update;
    }
}
