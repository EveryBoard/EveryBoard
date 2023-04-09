import { Injectable } from '@angular/core';
import { PartDAO } from '../dao/PartDAO';
import { MGPResult, Part, PartDocument, PartEventMove } from '../domain/Part';
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
import { PartService } from './PartService';
import { FirestoreDocument } from '../dao/FirestoreDAO';

export interface StartingPartConfig extends Partial<Part> {
    playerZero: MinimalUser,
    playerOne: MinimalUser,
    turn: number,
    beginning?: FirestoreTime,
}

@Injectable({
    providedIn: 'root',
})
export class GameService {

    public static VERBOSE: boolean = false;

    constructor(private readonly partDAO: PartDAO,
                private readonly partService: PartService,
                private readonly connectedUserService: ConnectedUserService,
                private readonly configRoomService: ConfigRoomService,
                private readonly chatService: ChatService)
    {
        display(GameService.VERBOSE, 'GameService.constructor');
    }
    public async updateAndBumpIndex(id: string,
                                    user: Player,
                                    lastIndex: number,
                                    update: Partial<Part>)
    : Promise<void>
    {
        update = {
            ...update,
            lastUpdate: {
                index: lastIndex + 1,
                player: user.value,
            },
        };
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
        display(GameService.VERBOSE, 'GameService.createPart(' + typeGame + ')');

        const playerZero: MinimalUser = this.connectedUserService.user.get().toMinimalUser();

        const newPart: Part = {
            lastUpdate: {
                index: 0,
                player: 0,
            },
            typeGame,
            playerZero,
            turn: -1,
            result: MGPResult.UNACHIEVED.value,
            listMoves: [],
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
        await this.configRoomService.createInitialConfigRoom(gameId);
        await this.createChat(gameId);
        return gameId;
    }
    private async startGameWithConfig(partId: string, user: Player, lastIndex: number, configRoom: ConfigRoom)
    : Promise<void>
    {
        display(GameService.VERBOSE, 'GameService.startGameWithConfig(' + partId + ', ' + JSON.stringify(configRoom));
        const update: StartingPartConfig = this.getStartingConfig(configRoom);
        await Promise.all([this.updateAndBumpIndex(partId, user, lastIndex, update),
                           this.partService.startGame(partId, user)]);
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
        display(GameService.VERBOSE, 'GameService.deletePart(' + partId + ')');
        return this.partDAO.delete(partId);
    }
    public async acceptConfig(partId: string, configRoom: ConfigRoom): Promise<void> {
        display(GameService.VERBOSE, { gameService_acceptConfig: { partId, configRoom } });

        await this.configRoomService.acceptConfig(partId);
        return this.startGameWithConfig(partId, Player.ONE, 0, configRoom);
    }
    public getPart(partId: string): Promise<MGPOptional<Part>> {
        return this.partDAO.read(partId);
    }
    public subscribeToChanges(partId: string, callback: (part: MGPOptional<Part>) => void): Subscription {
        return this.partDAO.subscribeToChanges(partId, callback);
    }
    public resign(partId: string,
                  lastIndex: number,
                  user: Player,
                  winner: MinimalUser,
                  loser: MinimalUser)
    : Promise<void>
    {
        const update: Partial<Part> = {
            winner,
            loser,
            result: MGPResult.RESIGN.value,
            request: null,
        };
        return this.updateAndBumpIndex(partId, user, lastIndex, update);
    }
    public notifyTimeout(partId: string,
                         user: Player,
                         lastIndex: number,
                         winner: MinimalUser,
                         loser: MinimalUser)
    : Promise<void>
    {
        const update: Partial<Part> = {
            winner,
            loser,
            result: MGPResult.TIMEOUT.value,
            request: null,
        };
        return this.updateAndBumpIndex(partId, user, lastIndex, update);
    }
    public async proposeDraw(partId: string, player: Player): Promise<void> {
        await this.partService.addRequest(partId, player, 'Draw');
    }
    public async acceptDraw(partId: string, lastIndex: number, player: Player): Promise<void> {
        await this.partService.addReply(partId, player, 'Accept', 'Draw');
        const result: MGPResult = player === Player.ZERO ?
            MGPResult.AGREED_DRAW_BY_ZERO : MGPResult.AGREED_DRAW_BY_ONE;
        const update: Partial<Part> = {
            result: result.value,
        };
        return this.updateAndBumpIndex(partId, player, lastIndex, update);
    }
    public async refuseDraw(partId: string, player: Player): Promise<void> {
        await this.partService.addReply(partId, player, 'Reject', 'Draw');
    }
    public async proposeRematch(partId: string, player: Player): Promise<void> {
        await this.partService.addRequest(partId, player, 'Rematch');
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
        const startingConfig: StartingPartConfig = this.getStartingConfig(newConfigRoom);
        const newPart: Part = {
            lastUpdate: {
                index: 0,
                player: player.value,
            },
            typeGame: part.typeGame,
            result: MGPResult.UNACHIEVED.value,
            listMoves: [],
            ...startingConfig,
        };

        const rematchId: string = await this.partDAO.create(newPart);
        await this.configRoomService.createConfigRoom(rematchId, newConfigRoom);
        await this.createChat(rematchId);
        await this.partService.addReply(partDocument.id, player, 'Accept', 'Rematch', rematchId);
        await this.partService.startGame(rematchId, player);
    }
    public async askTakeBack(partId: string, player: Player): Promise<void> {
        await this.partService.addRequest(partId, player, 'TakeBack');
    }
    public async acceptTakeBack(partId: string, part: PartDocument, player: Player): Promise<void> {
        const lastMove: FirestoreDocument<PartEventMove> = await this.partService.getLastMoveDoc(partId);
        let turn: number = part.data.turn;
        turn--;
        if (lastMove.data.player === player.value) {
            // We need to take back a second time to let the requester take back their move
            turn--;
        }
        const update: Partial<Part> = {
            turn,
            lastUpdateTime: serverTimestamp(),
        };
        const lastIndex: number = part.data.lastUpdate.index;
        await this.partService.addReply(partId, player, 'Accept', 'TakeBack' );
        return await this.updateAndBumpIndex(partId, player, lastIndex, update);
    }
    public async refuseTakeBack(partId: string, player: Player): Promise<void> {
        await this.partService.addReply(partId, player, 'Reject', 'TakeBack');
    }
    public async addGlobalTime(partId: string, player: Player): Promise<void> {
        await this.partService.addAction(partId, player, 'AddGlobalTime')
    }
    public async addTurnTime(partId: string, player: Player): Promise<void> {
        await this.partService.addAction(partId, player, 'AddTurnTime');
    }
    public async updatePart(partId: string,
                            player: Player,
                            scores?: [number, number],
                            notifyDraw?: boolean,
                            winner?: MinimalUser,
                            loser?: MinimalUser)
    : Promise<void>
    {
        display(GameService.VERBOSE, { gameService_updateDBBoard: { partId, scores, notifyDraw, winner, loser } });

        const part: Part = (await this.partDAO.read(partId)).get();
        const lastIndex: number = part.lastUpdate.index;
        const turn: number = part.turn + 1;
        let update: Partial<Part> = {
            turn,
            request: null,
            lastUpdateTime: serverTimestamp(),
        };
        update = this.updateScore(update, scores);
        if (winner != null) {
            update = {
                ...update,
                winner,
                loser,
                result: MGPResult.VICTORY.value,
            };
        } else if (notifyDraw === true) {
            update = {
                ...update,
                result: MGPResult.HARD_DRAW.value,
            };
        }
        return await this.updateAndBumpIndex(partId, player, lastIndex, update);
    }
    public async addMove(partId: string, player: Player, encodedMove: JSONValue): Promise<void> {
        await this.partService.addMove(partId, player, encodedMove);
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
