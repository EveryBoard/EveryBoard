import { Injectable } from '@angular/core';
import { PartDAO } from '../dao/PartDAO';
import { MGPResult, Part, PartDocument } from '../domain/Part';
import { FirstPlayer, ConfigRoom, PartStatus } from '../domain/ConfigRoom';
import { ConfigRoomService } from './ConfigRoomService';
import { ChatService } from './ChatService';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display, JSONValue, Utils } from 'src/app/utils/utils';
import { MGPOptional } from '../utils/MGPOptional';
import { Subscription } from 'rxjs';
import { serverTimestamp } from 'firebase/firestore';
import { MinimalUser } from '../domain/MinimalUser';
import { ConnectedUserService } from './ConnectedUserService';
import { FirestoreTime } from '../domain/Time';
import { UserService } from './UserService';
import { EloInfo } from '../domain/EloInfo';
import { GameEventService } from './GameEventService';

export interface StartingPartConfig extends Partial<Part> {
    playerZero: MinimalUser,
    playerZeroElo: number,
    playerOne: MinimalUser,
    playerOneElo: number,
    turn: number,
    beginning?: FirestoreTime,
}

@Injectable({
    providedIn: 'root',
})
export class GameService {

    public static VERBOSE: boolean = false;

    public constructor(private readonly partDAO: PartDAO,
                       private readonly gameEventService: GameEventService,
                       private readonly connectedUserService: ConnectedUserService,
                       private readonly userService: UserService,
                       private readonly configRoomService: ConfigRoomService,
                       private readonly chatService: ChatService)
    {
        display(GameService.VERBOSE, 'GameService.constructor');
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
    private async createUnstartedPart(typeGame: string): Promise<string> {
        display(GameService.VERBOSE, 'GameService.createUnstartedPart(' + typeGame + ')');

        const playerZero: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        console.log("c'est chiantous qu'on m'attindou")
        const playerZeroElo: number = (await this.userService.getPlayerInfo(playerZero, typeGame)).currentElo;
        console.log("mazis j'aistu finitos!")

        const newPart: Part = {
            typeGame,
            playerZero,
            playerZeroElo,
            turn: -1,
            result: MGPResult.UNACHIEVED.value,
        };
        return this.partDAO.create(newPart);
    }
    private createChat(chatId: string): Promise<void> {
        display(GameService.VERBOSE, 'GameService.createChat(' + chatId + ')');

        return this.chatService.createNewChat(chatId);
    }
    public async createPartConfigRoomAndChat(typeGame: string): Promise<string> {
        display(GameService.VERBOSE, `GameService.createGame(${typeGame})`);

        const gameId: string = await this.createUnstartedPart(typeGame);
        await this.configRoomService.createInitialConfigRoom(gameId, typeGame);
        await this.createChat(gameId);
        return gameId;
    }
    public async getStartingConfig(configRoom: ConfigRoom): Promise<StartingPartConfig> {
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
        const playerZeroInfo: EloInfo = await this.userService.getPlayerInfo(playerZero, configRoom.typeGame);
        const playerZeroElo: number = playerZeroInfo.currentElo;
        const playerOneInfo: EloInfo = await this.userService.getPlayerInfo(playerOne, configRoom.typeGame);
        const playerOneElo: number = playerOneInfo.currentElo;
        // TODO: TODOTODO round low the elo
        console.log('getStartingConfig', playerZeroElo, ' vs ', playerOneElo)
        return {
            playerZero,
            playerZeroElo,
            playerOne,
            playerOneElo,
            turn: 0,
            beginning: serverTimestamp(),
        };
    }
    public deletePart(partId: string): Promise<void> {
        display(GameService.VERBOSE, 'GameService.deletePart(' + partId + ')');
        return this.partDAO.delete(partId);
    }
    public async acceptConfig(partId: string, configRoom: ConfigRoom): Promise<void> {
        display(GameService.VERBOSE, { gameService_acceptConfig: { partId, configRoom } });

        await this.configRoomService.acceptConfig(partId);

        const update: StartingPartConfig = await this.getStartingConfig(configRoom);
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
    public async resign(part: PartDocument, player: Player, winner: MinimalUser, loser: MinimalUser): Promise<void> {
        const update: Partial<Part> = {
            winner,
            loser,
            result: MGPResult.RESIGN.value,
        };
        const winningPlayer: 'ZERO' |'ONE' = part.data.playerZero.id === winner.id ? 'ZERO' : 'ONE';
        await this.userService.updateElo(part.data.typeGame,
                                         part.data.playerZero,
                                         part.data.playerOne as MinimalUser,
                                         winningPlayer);
        await this.partDAO.update(part.id, update);
        await this.gameEventService.addAction(part.id, player, 'EndGame');
    }
    public async notifyTimeout(part: PartDocument, player: Player, winner: MinimalUser, loser: MinimalUser)
    : Promise<void>
    {
        const update: Partial<Part> = {
            winner,
            loser,
            result: MGPResult.TIMEOUT.value,
        };
        const winningPlayer: 'ZERO' |'ONE' = part.data.playerZero.id === winner.id ? 'ZERO' : 'ONE';
        await this.userService.updateElo(part.data.typeGame,
                                         part.data.playerZero,
                                         part.data.playerOne as MinimalUser,
                                         winningPlayer);
        await this.partDAO.update(part.id, update);
        await this.gameEventService.addAction(part.id, player, 'EndGame');
    }
    public async proposeDraw(partId: string, player: Player): Promise<void> {
        await this.gameEventService.addRequest(partId, player, 'Draw');
    }
    public async acceptDraw(part: PartDocument, player: Player): Promise<void> {
        await this.gameEventService.addReply(part.id, player, 'Accept', 'Draw');
        const result: MGPResult = player === Player.ZERO ?
            MGPResult.AGREED_DRAW_BY_ZERO : MGPResult.AGREED_DRAW_BY_ONE;
        const update: Partial<Part> = {
            result: result.value,
        };
        await this.userService.updateElo(part.data.typeGame,
                                         part.data.playerZero,
                                         part.data.playerOne as MinimalUser,
                                         'DRAW');
        await this.partDAO.update(part.id, update);
        await this.gameEventService.addAction(part.id, player, 'EndGame');
    }
    public async refuseDraw(partId: string, player: Player): Promise<void> {
        await this.gameEventService.addReply(partId, player, 'Reject', 'Draw');
    }
    public async proposeRematch(partId: string, player: Player): Promise<void> {
        await this.gameEventService.addRequest(partId, player, 'Rematch');
    }
    public async acceptRematch(partDocument: PartDocument, player: Player): Promise<void> {
        display(GameService.VERBOSE, { called: 'GameService.acceptRematch', partDocument });
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
        const startingConfig: StartingPartConfig = await this.getStartingConfig(newConfigRoom);
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
    public async acceptTakeBack(partId: string, part: Part, player: Player): Promise<void> {
        let turn: number = part.turn;
        turn--;
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
    private async preparePartUpdate(partId: string, scores?: [number, number]): Promise<Partial<Part>> {
        const part: Part = (await this.partDAO.read(partId)).get();
        const turn: number = part.turn + 1;
        let update: Partial<Part> = {
            turn,
        };
        update = this.updateScore(update, scores);
        return update;
    }
    public async updatePart(partId: string, scores?: [number, number]): Promise<void> {
        display(GameService.VERBOSE, { gameService_updatePart: { partId, scores } });
        const update: Partial<Part> = await this.preparePartUpdate(partId, scores);
        await this.update(partId, update);
    }
    public async drawPart(part: PartDocument, player: Player, scores?: [number, number]): Promise<void> {
        let update: Partial<Part> = await this.preparePartUpdate(part.id, scores);
        update = {
            ...update,
            result: MGPResult.HARD_DRAW.value,
        };
        await this.userService.updateElo(part.data.typeGame,
                                         part.data.playerZero,
                                         part.data.playerOne as MinimalUser,
                                         'DRAW');
        await this.update(part.id, update);
        await this.gameEventService.addAction(part.id, player, 'EndGame');
    }
    public async endPartWithVictory(part: PartDocument,
                                    player: Player,
                                    winner: MinimalUser,
                                    loser: MinimalUser,
                                    scores?: [number, number]): Promise<void> {
        let update: Partial<Part> = await this.preparePartUpdate(part.id, scores);
        update = {
            ...update,
            winner,
            loser,
            result: MGPResult.VICTORY.value,
        };
        const winningPlayer: 'ZERO' |'ONE' = part.data.playerZero.id === winner.id ? 'ZERO' : 'ONE';
        await this.userService.updateElo(part.data.typeGame,
                                         part.data.playerZero,
                                         part.data.playerOne as MinimalUser,
                                         winningPlayer);
        await this.update(part.id, update);
        await this.gameEventService.addAction(part.id, player, 'EndGame');
    }
    public async addMove(partId: string, player: Player, encodedMove: JSONValue): Promise<void> {
        await this.gameEventService.addMove(partId, player, encodedMove);
    }
    private updateScore(update: Partial<Part>, scores?: [number, number]): Partial<Part> {
        if (scores !== undefined) {
            return {
                ...update,
                scorePlayerZero: scores[0],
                scorePlayerOne: scores[1],
            };
        }
        return update;
    }
}
