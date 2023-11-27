import { Injectable } from '@angular/core';
import { MGPValidation, MGPOptional, JSONValue, Utils } from '@everyboard/lib';
import { PartDAO } from '../dao/PartDAO';
import { MGPResult, Part, PartDocument } from '../domain/Part';
import { FirstPlayer, ConfigRoom, PartStatus } from '../domain/ConfigRoom';
import { ConfigRoomService } from './ConfigRoomService';
import { ChatService } from './ChatService';
import { Player } from 'src/app/jscaip/Player';
import { Subscription } from 'rxjs';
import { serverTimestamp } from 'firebase/firestore';
import { MinimalUser } from '../domain/MinimalUser';
import { ConnectedUserService } from './ConnectedUserService';
import { FirestoreTime } from '../domain/Time';
import { GameEventService } from './GameEventService';
import { Debug } from '../utils/Debug';

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
                       private readonly chatService: ChatService)
    {
    }
    private async update(id: string, update: Partial<Part>): Promise<void> {
        return this.partDAO.update(id, update);
    }
    public async getPartValidity(partId: string, gameType: string): Promise<MGPValidation> {
        const part: MGPOptional<Part> = await this.partDAO.read(partId);
        if (part.isAbsent()) {
            return MGPValidation.failure('NONEXISTENT_PART');
        }
        if (part.get().typeGame === gameType) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure('WRONG_GAME_TYPE');
        }
    }
    private createUnstartedPart(typeGame: string): Promise<string> {
        const playerZero: MinimalUser = this.connectedUserService.user.get().toMinimalUser();

        const newPart: Part = {
            typeGame,
            playerZero,
            turn: -1,
            result: MGPResult.UNACHIEVED.value,
        };
        return this.partDAO.create(newPart);
    }
    private createChat(chatId: string): Promise<void> {
        return this.chatService.createNewChat(chatId);
    }
    public async createPartConfigRoomAndChat(typeGame: string): Promise<string> {
        const gameId: string = await this.createUnstartedPart(typeGame);
        await this.configRoomService.createInitialConfigRoom(gameId);
        await this.createChat(gameId);
        return gameId;
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
    public deletePart(partId: string): Promise<void> {
        return this.partDAO.delete(partId);
    }
    public async acceptConfig(partId: string, configRoom: ConfigRoom): Promise<void> {
        await this.configRoomService.acceptConfig(partId);

        const update: StartingPartConfig = this.getStartingConfig(configRoom);
        let accepter: Player;
        if (update.playerZero === configRoom.creator) {
            accepter = Player.ONE;
        } else {
            accepter = Player.ZERO;
        }
        await this.partDAO.update(partId, update);
        await this.gameEventService.startGame(partId, accepter);
    }
    public getPart(partId: string): Promise<MGPOptional<Part>> {
        return this.partDAO.read(partId);
    }
    public subscribeToChanges(partId: string, callback: (part: MGPOptional<Part>) => void): Subscription {
        return this.partDAO.subscribeToChanges(partId, callback);
    }
    public async resign(partId: string, player: Player, winner: MinimalUser, loser: MinimalUser): Promise<void> {
        const update: Partial<Part> = {
            winner,
            loser,
            result: MGPResult.RESIGN.value,
        };
        await this.partDAO.update(partId, update);
        await this.gameEventService.addAction(partId, player, 'EndGame');
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
