import { Injectable } from '@angular/core';
import { MGPValidation, MGPOptional, JSONValue, Utils, MGPFallible } from '@everyboard/lib';
import { PartDAO } from '../dao/PartDAO';
import { Part } from '../domain/Part';
import { Subscription } from 'rxjs';
import { MinimalUser } from '../domain/MinimalUser';
import { FirestoreTime } from '../domain/Time';
import { UserService } from './UserService';
import { EloInfo } from '../domain/EloInfo';
import { GameEventService } from './GameEventService';
import { BackendService } from './BackendService';
import { Player, PlayerOrNone } from '../jscaip/Player';
import { PlayerNumberMap } from '../jscaip/PlayerMap';
import { Debug } from '../utils/Debug';
import { ConnectedUserService } from './ConnectedUserService';

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
@Debug.log
export class GameService extends BackendService {

    public constructor(protected readonly partDAO: PartDAO,
                       connectedUserService: ConnectedUserService)
    {
        super(connectedUserService);
    }
// TODO: this comment code serve as TODO as it has to be moved inside the backend
    // private async createUnstartedPart(typeGame: string): Promise<string> {
    //     display(GameService.VERBOSE, 'GameService.createUnstartedPart(' + typeGame + ')');

    //     const playerZero: MinimalUser = this.connectedUserService.user.get().toMinimalUser();
    //     console.log("c'est chiantous qu'on m'attindou")
    //     const playerZeroElo: number = (await this.userService.getPlayerInfo(playerZero, typeGame)).currentElo;
    //     console.log("mazis j'aistu finitos!")

    //     const newPart: Part = {
    //         typeGame,
    //         playerZero,
    //         playerZeroElo,
    //         turn: -1,
    //         result: MGPResult.UNACHIEVED.value,
    //     };
    //     return this.partDAO.create(newPart);
    // }
    // public async getStartingConfig(configRoom: ConfigRoom): Promise<StartingPartConfig> {
    //     let whoStarts: FirstPlayer = FirstPlayer.of(configRoom.firstPlayer);
    //     if (whoStarts === FirstPlayer.RANDOM) {
    //         if (Math.random() < 0.5) {
    //             whoStarts = FirstPlayer.CREATOR;
    //         } else {
    //             whoStarts = FirstPlayer.CHOSEN_PLAYER;
    //         }
    //     }
    //     let playerZero: MinimalUser;
    //     let playerOne: MinimalUser;
    //     if (whoStarts === FirstPlayer.CREATOR) {
    //         playerZero = configRoom.creator;
    //         playerOne = Utils.getNonNullable(configRoom.chosenOpponent);
    //     } else {
    //         playerZero = Utils.getNonNullable(configRoom.chosenOpponent);
    //         playerOne = configRoom.creator;
    //     }
    //     const playerZeroInfo: EloInfo = await this.userService.getPlayerInfo(playerZero, configRoom.typeGame);
    //     const playerZeroElo: number = playerZeroInfo.currentElo;
    //     const playerOneInfo: EloInfo = await this.userService.getPlayerInfo(playerOne, configRoom.typeGame);
    //     const playerOneElo: number = playerOneInfo.currentElo;
    //     // TODO: TODOTODO round low the elo, so elo are 158.75896 but displayed as 158 !
    //     console.log('getStartingConfig', playerZeroElo, ' vs ', playerOneElo)
    //     return {
    //         playerZero,
    //         playerZeroElo,
    //         playerOne,
    //         playerOneElo,
    //         turn: 0,
    //         beginning: serverTimestamp(),
    //     };
    // }
    // public async notifyTimeout(part: PartDocument, player: Player, winner: MinimalUser, loser: MinimalUser)
    // : Promise<void>
    // {
    //     const update: Partial<Part> = {
    //         winner,
    //         loser,
    //         result: MGPResult.TIMEOUT.value,
    //     };
    //     const winningPlayer: 'ZERO' |'ONE' = part.data.playerZero.id === winner.id ? 'ZERO' : 'ONE';
    //     await this.userService.updateElo(part.data.typeGame,
    //                                      part.data.playerZero,
    //                                      part.data.playerOne as MinimalUser,
    //                                      winningPlayer);
    //     await this.partDAO.update(part.id, update);
    //     await this.gameEventService.addAction(part.id, player, 'EndGame');
    // }
    // public async acceptDraw(part: PartDocument, player: Player): Promise<void> {
    //     await this.gameEventService.addReply(part.id, player, 'Accept', 'Draw');
    //     const result: MGPResult = player === Player.ZERO ?
    //         MGPResult.AGREED_DRAW_BY_ZERO : MGPResult.AGREED_DRAW_BY_ONE;
    //     const update: Partial<Part> = {
    //         result: result.value,
    //     };
    //     await this.userService.updateElo(part.data.typeGame,
    //                                      part.data.playerZero,
    //                                      part.data.playerOne as MinimalUser,
    //                                      'DRAW');
    //     await this.partDAO.update(part.id, update);
    //     await this.gameEventService.addAction(part.id, player, 'EndGame');
    // }

    public subscribeToChanges(partId: string, callback: (part: MGPOptional<Part>) => void): Subscription {
        return this.partDAO.subscribeToChanges(partId, callback);
    }

    /** Create a game, its config room and chat. Return the id of the created game. */
    public async createGame(gameName: string): Promise<string> {
        const result: MGPFallible<JSONValue> =
            await this.performRequestWithJSONResponse('POST', `game?gameName=${gameName}`);
        this.assertSuccess(result);
        // eslint-disable-next-line dot-notation
        return Utils.getNonNullable(Utils.getNonNullable(result.get())['id']) as string;
    }

    /** Retrieve the name of the game with the given id. If there is no corresponding game, returns an empty option. */
    public async getGameName(gameId: string): Promise<MGPOptional<string>> {
        const result: MGPFallible<JSONValue> =
            await this.performRequestWithJSONResponse('GET', `game/${gameId}?onlyGameName`);
        if (result.isSuccess()) {
            // eslint-disable-next-line dot-notation
            const gameName: string = Utils.getNonNullable(Utils.getNonNullable(result.get())['gameName']) as string;
            return MGPOptional.of(gameName);
        } else {
            return MGPOptional.empty();
        }
    }

    /** Get a full game description */
    public async getExistingGame(gameId: string): Promise<Part> {
        const result: MGPFallible<JSONValue> = await this.performRequestWithJSONResponse('GET', `game/${gameId}`);
        this.assertSuccess(result);
        return result.get() as Part;
    }

    /** Delete a game */
    public async deleteGame(gameId: string): Promise<void> {
        const result: MGPFallible<Response> = await this.performRequest('DELETE', `game/${gameId}`);
        this.assertSuccess(result);
    }

    /** Perform a specific game action and asserts that it has succeeded */
    private async gameAction(gameId: string, action: string): Promise<void> {
        const endpoint: string = `game/${gameId}?action=${action}`;
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    /** Accept a game config */
    public async acceptConfig(gameId: string): Promise<void> {
        const endpoint: string = `config-room/${gameId}?action=accept`;
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    /** Give the current player resignation in a game */
    public async resign(gameId: string): Promise<void> {
        return this.gameAction(gameId, 'resign');
    }

    /** Notify the timeout of a player in a game */
    public async notifyTimeout(gameId: string, winner: MinimalUser, loser: MinimalUser): Promise<void> {
        const winnerURLEncoded: string = encodeURIComponent(JSON.stringify(winner));
        const loserURLEncoded: string = encodeURIComponent(JSON.stringify(loser));
        const endpoint: string = `game/${gameId}?action=notifyTimeout&winner=${winnerURLEncoded}&loser=${loserURLEncoded}`;
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    /** Propose a draw to the opponent */
    public async proposeDraw(gameId: string): Promise<void> {
        return this.gameAction(gameId, 'proposeDraw');
    }

    /** Accept the draw request of the opponent */
    public async acceptDraw(gameId: string): Promise<void> {
        return this.gameAction(gameId, 'acceptDraw');
    }

    /** Refuse a draw request from the opponent */
    public async refuseDraw(gameId: string): Promise<void> {
        return this.gameAction(gameId, 'refuseDraw');
    }

    /** Propose a rematch to the opponent */
    public async proposeRematch(gameId: string): Promise<void> {
        return this.gameAction(gameId, 'proposeRematch');
    }

    /** Accept a rematch request from the opponent */
    public async acceptRematch(gameId: string): Promise<void> {
        return this.gameAction(gameId, 'acceptRematch');
    }

    /** Reject a rematch request from the opponent */
    public async rejectRematch(gameId: string): Promise<void> {
        return this.gameAction(gameId, 'rejectRematch');
    }

    /** Ask to take back one of our moves */
    public async askTakeBack(gameId: string): Promise<void> {
        return this.gameAction(gameId, 'askTakeBack');
    }

    /** Accept that opponent takes back a move */
    public async acceptTakeBack(gameId: string): Promise<void> {
        return this.gameAction(gameId, 'acceptTakeBack');
    }

    /** Refuse that opponent takes back a move */
    public async refuseTakeBack(gameId: string): Promise<void> {
        return this.gameAction(gameId, 'refuseTakeBack');
    }

    /** Add global time to the opponent */
    public async addGlobalTime(gameId: string): Promise<void> {
        return this.gameAction(gameId, 'addGlobalTime');
    }

    /** Add turn time to the opponent */
    public async addTurnTime(gameId: string): Promise<void> {
        return this.gameAction(gameId, 'addTurnTime');
    }

    /** Play a move */
    public async addMove(gameId: string,
                         move: JSONValue,
                         scores: MGPOptional<PlayerNumberMap>)
    : Promise<void>
    {
        const moveURLEncoded: string = encodeURIComponent(JSON.stringify(move));
        let endpoint: string = `game/${gameId}?action=move&move=${moveURLEncoded}`;
        if (scores.isPresent()) {
            const score0: number = scores.get().get(Player.ZERO);
            const score1: number = scores.get().get(Player.ONE);
            endpoint += `&score0=${score0}&score1=${score1}`;
        }
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }
// TODO: move that in the backed
    // public async drawPart(part: PartDocument, player: Player, scores?: [number, number]): Promise<void> {
    //     let update: Partial<Part> = await this.preparePartUpdate(part.id, scores);
    //     update = {
    //         ...update,
    //         result: MGPResult.HARD_DRAW.value,
    //     };
    //     await this.userService.updateElo(part.data.typeGame,
    //                                      part.data.playerZero,
    //                                      part.data.playerOne as MinimalUser,
    //                                      'DRAW');
    //     await this.update(part.id, update);
    //     await this.gameEventService.addAction(part.id, player, 'EndGame');
    // }
    // public async endPartWithVictory(part: PartDocument,
    //                                 player: Player,
    //                                 winner: MinimalUser,
    //                                 loser: MinimalUser,
    //                                 scores?: [number, number]): Promise<void> {
    //     let update: Partial<Part> = await this.preparePartUpdate(part.id, scores);
    //     update = {
    //         ...update,
    //         winner,
    //         loser,
    //         result: MGPResult.VICTORY.value,
    //     };
    //     const winningPlayer: 'ZERO' |'ONE' = part.data.playerZero.id === winner.id ? 'ZERO' : 'ONE';
    //     await this.userService.updateElo(part.data.typeGame,
    //                                      part.data.playerZero,
    //                                      part.data.playerOne as MinimalUser,
    //                                      winningPlayer);
    //     await this.update(part.id, update);
    //     await this.gameEventService.addAction(part.id, player, 'EndGame');
    // }

    /** Play a final move */
    public async addMoveAndEndGame(gameId: string,
                                   move: JSONValue,
                                   scores: MGPOptional<PlayerNumberMap>,
                                   winner: PlayerOrNone)
    : Promise<void>
    {
        const moveURLEncoded: string = encodeURIComponent(JSON.stringify(move));
        let endpoint: string = `game/${gameId}?action=moveAndEnd&move=${moveURLEncoded}`;
        if (scores.isPresent()) {
            const score0: number = scores.get().get(Player.ZERO);
            const score1: number = scores.get().get(Player.ONE);
            endpoint += `&score0=${score0}&score1=${score1}`;
        }
        if (winner.isPlayer()) {
            endpoint += `&winner=${winner.getValue()}`;
        }
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    public async getGameValidity(gameId: string, gameName: string): Promise<MGPValidation> {
        const realGameName: MGPOptional<string> = await this.getGameName(gameId);
        if (realGameName.isAbsent()) {
            return MGPValidation.failure($localize`This game does not exist!`);
        } else if (realGameName.get() !== gameName) {
            return MGPValidation.failure($localize`This is the wrong game type!`);
        } else {
            return MGPValidation.SUCCESS;
        }
    }

}
