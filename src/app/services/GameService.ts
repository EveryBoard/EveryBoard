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
    public async notifyTimeout(partId: string, player: Player, winner: MinimalUser, loser: MinimalUser): Promise<void> {
        const update: Partial<Part> = {
            winner,
            loser,
            result: MGPResult.TIMEOUT.value,
        };
        await this.partDAO.update(partId, update);
        await this.gameEventService.addAction(partId, player, 'EndGame');
    }
    public async proposeDraw(partId: string, player: Player): Promise<void> {
        await this.gameEventService.addRequest(partId, player, 'Draw');
    }
    public async acceptDraw(partId: string, player: Player): Promise<void> {
        await this.gameEventService.addReply(partId, player, 'Accept', 'Draw');
        const result: MGPResult = player === Player.ZERO ?
            MGPResult.AGREED_DRAW_BY_ZERO : MGPResult.AGREED_DRAW_BY_ONE;
        const update: Partial<Part> = {
            result: result.value,
        };
        await this.partDAO.update(partId, update);
        await this.gameEventService.addAction(partId, player, 'EndGame');
    }
    public async refuseDraw(partId: string, player: Player): Promise<void> {
        await this.gameEventService.addReply(partId, player, 'Reject', 'Draw');
    }
    public async proposeRematch(partId: string, player: Player): Promise<void> {
        await this.gameEventService.addRequest(partId, player, 'Rematch');
    }
    public async rejectRematch(partId: string, player: Player): Promise<void> {
        await this.gameEventService.addReply(partId, player, 'Reject', 'Rematch');
    }
    public async acceptRematch(partDocument: PartDocument, player: Player): Promise<void> {
        const part: Part = Utils.getNonNullable(partDocument.data);

        const configRoom: ConfigRoom = await this.configRoomService.readConfigRoomById(partDocument.id);
        let firstPlayer: FirstPlayer; // firstPlayer will be switched across rematches
        // creator is the one who accepts the rematch
        const creator: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        let chosenOpponent: MinimalUser;
        if (part.playerZero.id === creator.id) {
            chosenOpponent = Utils.getNonNullable(part.playerOne);
            firstPlayer = FirstPlayer.CHOSEN_PLAYER;
        } else {
            chosenOpponent = part.playerZero;
            firstPlayer = FirstPlayer.CREATOR;
        }
        const newConfigRoom: ConfigRoom = {
            ...configRoom, // unchanged attributes
            firstPlayer: firstPlayer.value,
            creator,
            chosenOpponent,
            partStatus: PartStatus.PART_STARTED.value, // game ready to start
        };
        const startingConfig: StartingPartConfig = this.getStartingConfig(newConfigRoom);
        const newPart: Part = {
            typeGame: part.typeGame,
            result: MGPResult.UNACHIEVED.value,
            ...startingConfig,
        };

        const rematchId: string = await this.partDAO.create(newPart);
        await this.configRoomService.createConfigRoom(rematchId, newConfigRoom);
        await this.createChat(rematchId);
        await this.gameEventService.addReply(partDocument.id, player, 'Accept', 'Rematch', rematchId);
        await this.gameEventService.startGame(rematchId, player.getOpponent());
    }
    public async askTakeBack(partId: string, player: Player): Promise<void> {
        await this.gameEventService.addRequest(partId, player, 'TakeBack');
    }
    public async acceptTakeBack(partId: string, currentTurn: number, player: Player): Promise<void> {
        let turn: number = currentTurn-1;
        if (turn % 2 === player.value) {
            // We need to take back a second time to let the requester take back their move
            turn--;
        }
        const update: Partial<Part> = {
            turn,
        };
        await this.gameEventService.addReply(partId, player, 'Accept', 'TakeBack' );
        return await this.partDAO.update(partId, update);
    }
    public async refuseTakeBack(partId: string, player: Player): Promise<void> {
        await this.gameEventService.addReply(partId, player, 'Reject', 'TakeBack');
    }
    public async addGlobalTime(partId: string, player: Player): Promise<void> {
        await this.gameEventService.addAction(partId, player, 'AddGlobalTime');
    }
    public async addTurnTime(partId: string, player: Player): Promise<void> {
        await this.gameEventService.addAction(partId, player, 'AddTurnTime');
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
