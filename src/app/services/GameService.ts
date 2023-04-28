import { Injectable } from '@angular/core';
import { PartDAO } from '../dao/PartDAO';
import { MGPResult, Part, PartDocument } from '../domain/Part';
import { FirstPlayer, ConfigRoom, PartStatus } from '../domain/ConfigRoom';
import { ConfigRoomService } from './ConfigRoomService';
import { ChatService } from './ChatService';
import { Request } from '../domain/Request';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Player } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { MGPOptional } from '../utils/MGPOptional';
import { Subscription } from 'rxjs';
import { serverTimestamp } from 'firebase/firestore';
import { MinimalUser } from '../domain/MinimalUser';
import { ConnectedUserService } from './ConnectedUserService';
import { FirestoreTime } from '../domain/Time';
import { UserService } from './UserService';
import { EloInfo } from '../domain/EloInfo';

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

    constructor(private readonly partDAO: PartDAO,
                private readonly connectedUserService: ConnectedUserService,
                private readonly userService: UserService,
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
    private async createUnstartedPart(typeGame: string): Promise<string> {
        display(GameService.VERBOSE,
                'GameService.createPart(' + typeGame + ')');

        const playerZero: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
        console.log("c'est chiantous qu'on m'attindou")
        const playerZeroElo: number = (await this.userService.getPlayerInfo(playerZero, typeGame)).currentElo;
        console.log("mazis j'aistu finitos!")

        const newPart: Part = {
            lastUpdate: {
                index: 0,
                player: 0,
            },
            typeGame,
            playerZero,
            playerZeroElo,
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
        await this.configRoomService.createInitialConfigRoom(gameId, typeGame);
        await this.createChat(gameId);
        return gameId;
    }
    private async startGameWithConfig(partId: string, user: Player, lastIndex: number, configRoom: ConfigRoom)
    : Promise<void>
    {
        display(GameService.VERBOSE, 'GameService.startGameWithConfig(' + partId + ', ' + JSON.stringify(configRoom));
        const update: StartingPartConfig = await this.getStartingConfig(configRoom);
        return this.updateAndBumpIndex(partId, user, lastIndex, update);
    }
    public async getStartingConfig(configRoom: ConfigRoom): Promise<StartingPartConfig>
    {
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
            remainingMsForZero: configRoom.totalPartDuration * 1000,
            remainingMsForOne: configRoom.totalPartDuration * 1000,
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
    public subscribeToChanges(partId: string, callback: (part: MGPOptional<Part>) => void): Subscription {
        return this.partDAO.subscribeToChanges(partId, callback);
    }
    public async resign(part: PartDocument,
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
        const winningPlayer: 'ZERO' |'ONE' = part.data.playerZero.id === winner.id ? 'ZERO' : 'ONE';
        await this.userService.updateElo(part.data.typeGame,
                                         part.data.playerZero,
                                         part.data.playerOne as MinimalUser,
                                         winningPlayer);
        return this.updateAndBumpIndex(part.id, user, lastIndex, update);
    }
    public async notifyTimeout(part: PartDocument,
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
        const winningPlayer: 'ZERO' |'ONE' = part.data.playerZero.id === winner.id ? 'ZERO' : 'ONE';
        await this.userService.updateElo(part.data.typeGame,
                                         part.data.playerZero,
                                         part.data.playerOne as MinimalUser,
                                         winningPlayer);
        return this.updateAndBumpIndex(part.id, user, lastIndex, update);
    }
    public sendRequest(partId: string, user: Player, lastIndex: number, request: Request): Promise<void> {
        return this.updateAndBumpIndex(partId, user, lastIndex, { request });
    }
    public proposeDraw(partId: string, lastIndex: number, player: Player): Promise<void> {
        return this.sendRequest(partId, player, lastIndex, Request.drawProposed(player));
    }
    public async acceptDraw(part: PartDocument, lastIndex: number, as: Player): Promise<void> {
        const mgpResult: MGPResult = as === Player.ZERO ? MGPResult.AGREED_DRAW_BY_ZERO : MGPResult.AGREED_DRAW_BY_ONE;
        const update: Partial<Part> = {
            result: mgpResult.value,
            request: null,
        };
        await this.userService.updateElo(part.data.typeGame,
                                         part.data.playerZero,
                                         part.data.playerOne as MinimalUser,
                                         'DRAW');
        return this.updateAndBumpIndex(part.id, as, lastIndex, update);
    }
    public refuseDraw(partId: string, lastIndex: number, player: Player): Promise<void> {
        return this.sendRequest(partId, player, lastIndex, Request.drawRefused(player));
    }
    public proposeRematch(partId: string, lastIndex: number, player: Player): Promise<void> {
        return this.sendRequest(partId, player, lastIndex, Request.rematchProposed(player));
    }
    public async acceptRematch(partDocument: PartDocument, lastIndex: number, user: Player): Promise<void> {
        display(GameService.VERBOSE, { called: 'GameService.acceptRematch(', partDocument });
        const part: Part = Utils.getNonNullable(partDocument.data);

        const iConfigRoom: ConfigRoom = await this.configRoomService.readConfigRoomById(partDocument.id);
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
            ...iConfigRoom, // unchanged attributes
            firstPlayer: firstPlayer.value,
            creator,
            chosenOpponent,
            partStatus: PartStatus.PART_STARTED.value, // game ready to start
        };
        const startingConfig: StartingPartConfig = await this.getStartingConfig(newConfigRoom);
        const newPart: Part = {
            lastUpdate: {
                index: 0,
                player: user.value,
            },
            typeGame: part.typeGame,
            result: MGPResult.UNACHIEVED.value,
            listMoves: [],
            ...startingConfig,
        };

        const rematchId: string = await this.partDAO.create(newPart);
        await this.configRoomService.createConfigRoom(rematchId, newConfigRoom);
        await this.createChat(rematchId);
        return this.sendRequest(partDocument.id, user, lastIndex, Request.rematchAccepted(part.typeGame, rematchId));
    }
    public askTakeBack(partId: string, lastIndex: number, player: Player): Promise<void> {
        return this.sendRequest(partId, player, lastIndex, Request.takeBackAsked(player));
    }
    public async acceptTakeBack(id: string, part: PartDocument, role: Player, msToSubstract: [number, number])
    : Promise<void>
    {
        const requester: Player = Request.getPlayer(Utils.getNonNullable(part.data.request));
        assert(requester !== role, 'Illegal to accept your own request');

        const request: Request = Request.takeBackAccepted(role);
        let listMoves: JSONValueWithoutArray[] = part.data.listMoves.slice(0, part.data.listMoves.length - 1);
        if (listMoves.length % 2 === role.value) {
            // Deleting a second move
            listMoves = listMoves.slice(0, listMoves.length - 1);
        }
        const update: Partial<Part> = {
            request,
            listMoves,
            turn: listMoves.length,
            lastUpdateTime: serverTimestamp(),
            remainingMsForZero: Utils.getNonNullable(part.data.remainingMsForZero) - msToSubstract[0],
            remainingMsForOne: Utils.getNonNullable(part.data.remainingMsForOne) - msToSubstract[1],
        };
        const lastIndex: number = part.data.lastUpdate.index;
        return await this.updateAndBumpIndex(id, role, lastIndex, update);
    }
    public refuseTakeBack(id: string, lastIndex: number, role: Player): Promise<void> {
        const request: Request = Request.takeBackRefused(role);
        return this.updateAndBumpIndex(id, role, lastIndex, { request });
    }
    public async addGlobalTime(id: string, lastIndex: number, part: Part, role: Player): Promise<void> {
        let update: Partial<Part> = {
            request: Request.addGlobalTime(role.getOpponent()),
        };
        if (role === Player.ZERO) {
            update = {
                ...update,
                remainingMsForOne: Utils.getNonNullable(part.remainingMsForOne) + 5 * 60 * 1000,
            };
        } else {
            update = {
                ...update,
                remainingMsForZero: Utils.getNonNullable(part.remainingMsForZero) + 5 * 60 * 1000,
            };
        }
        return await this.updateAndBumpIndex(id, role, lastIndex, update);
    }
    public async addTurnTime(role: Player, lastIndex: number, id: string): Promise<void> {
        const update: Partial<Part> = { request: Request.addTurnTime(role.getOpponent()) };
        return await this.updateAndBumpIndex(id, role, lastIndex, update);
    }
    public async updateDBBoard(part: PartDocument,
                               user: Player,
                               encodedMove: JSONValueWithoutArray,
                               msToSubstract: [number, number],
                               scores?: [number, number],
                               notifyDraw?: boolean,
                               winner?: MinimalUser,
                               loser?: MinimalUser)
    : Promise<void>
    {
        display(GameService.VERBOSE, { gameService_updateDBBoard: {
            partId: part.id, encodedMove, scores, msToSubstract, notifyDraw, winner, loser } });

        // const part: Part = (await this.partDAO.read(partId)).get(); // TODO: optimise this => MIGHT JUST BE DONE
        const lastIndex: number = part.data.lastUpdate.index;
        const turn: number = part.data.turn + 1;
        const listMoves: JSONValueWithoutArray[] = ArrayUtils.copyImmutableArray(part.data.listMoves);
        listMoves[listMoves.length] = encodedMove;
        let update: Partial<Part> = {
            listMoves,
            turn,
            request: null,
            lastUpdateTime: serverTimestamp(),
        };
        update = this.updateScore(update, scores);
        update = this.substractMs(update, part.data, msToSubstract);
        if (winner != null) {
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
        } else if (notifyDraw === true) {
            update = {
                ...update,
                result: MGPResult.HARD_DRAW.value,
            };
            await this.userService.updateElo(part.data.typeGame,
                                             part.data.playerZero,
                                             part.data.playerOne as MinimalUser,
                                             'DRAW');
        }
        return await this.updateAndBumpIndex(part.id, user, lastIndex, update);
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
    private substractMs(update: Partial<Part>, part: Partial<Part>, msToSubstract: [number, number]): Partial<Part> {
        if (msToSubstract[0] > 0) {
            return {
                ...update,
                remainingMsForZero: Utils.getNonNullable(part.remainingMsForZero) - msToSubstract[0],
            };
        }
        if (msToSubstract[1] > 0) {
            return {
                ...update,
                remainingMsForOne: Utils.getNonNullable(part.remainingMsForOne) - msToSubstract[1],
            };
        }
        return update;
    }
}
