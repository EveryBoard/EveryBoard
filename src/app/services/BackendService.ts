import { Injectable } from '@angular/core';
import { ConnectedUserService } from './ConnectedUserService';
import { Debug, JSONValue, Utils } from '../utils/utils';
import { environment } from 'src/environments/environment';
import { MGPFallible } from '../utils/MGPFallible';
import { MGPOptional } from '../utils/MGPOptional';
import { Part } from '../domain/Part';
import { MinimalUser } from '../domain/MinimalUser';
import { Player, PlayerOrNone } from '../jscaip/Player';
import { MGPValidation } from '../utils/MGPValidation';
import { PlayerNumberMap } from '../jscaip/PlayerMap';
import { ConfigRoom } from '../domain/ConfigRoom';

type HTTPMethod = 'POST' | 'GET' | 'PATCH' | 'HEAD' | 'DELETE';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class BackendService {
    public constructor(private readonly connectedUserService: ConnectedUserService) {
    }

    private async performRequest(method: HTTPMethod, endpoint: string): Promise<MGPFallible<Response>> {
        console.log('performing request: ' + method + ' ' + endpoint);
        const token: string = await this.connectedUserService.getIdToken();
        const response: Response =
            await fetch(environment.backendURL + '/' + endpoint, {
                method,
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
            });
        if (this.isSuccessStatus(response.status)) {
            return MGPFallible.success(response);
        } else {
            try {
                const jsonResponse: JSONValue = await response.json();
                const error: string = (jsonResponse != null && (jsonResponse['reason'] as string)) || 'No error message';
                return MGPFallible.failure(error);
            } catch (_: unknown) {
                return MGPFallible.failure('Invalid JSON response from the server');
            }
        }
    }
    private async performRequestWithJSONResponse(
        method: HTTPMethod,
        endpoint: string)
    : Promise<MGPFallible<JSONValue>>
    {
        const response: MGPFallible<Response> = await this.performRequest(method, endpoint);
        if (response.isSuccess()) {
            const jsonResponse: JSONValue = await response.get().json();
            return MGPFallible.success(jsonResponse);
        } else {
            return MGPFallible.failure(response.getReason());
        }
    }

    private isSuccessStatus(status: number): boolean {
        return status >= 200 && status <= 299;
    }

    private assertSuccess<T>(result: MGPFallible<T>): void {
        // TODO: better error handling?
        Utils.assert(result.isSuccess(), 'Unexpected error from backend: ' + result.getReasonOr(''));
    }

    /** Create a game, its config room and chat. Return the id of the created game. */
    public async createGame(gameName: string): Promise<string> {
        const result: MGPFallible<JSONValue> =
            await this.performRequestWithJSONResponse('POST', `game?gameName=${gameName}`);
        this.assertSuccess(result);
        // eslint-disable-next-line dot-notation
        return Utils.getNonNullable(result.get())['id'] as string ;
    }

    /** Retrieve the name of the game with the given id. If there is no corresponding game, returns an empty option. */
    public async getGameName(gameId: string): Promise<MGPOptional<string>> {
        const result: MGPFallible<JSONValue> =
            await this.performRequestWithJSONResponse('GET', `game/${gameId}?onlyGameName`);
        if (result.isSuccess()) {
            const gameName: string = Utils.getNonNullable(result.get())['gameName'] as string;
            return MGPOptional.of(gameName);
        } else {
            return MGPOptional.empty();
        }
    }

    /** Get a full game description */
    public async getGame(gameId: string): Promise<Part> {
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
        return this.gameAction(gameId, 'acceptConfig');
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

    /** Updates the score and increase the turn */
    public async endTurn(gameId: string, scores: MGPOptional<PlayerNumberMap>): Promise<void> {
        let endpoint: string = `game/${gameId}?action=endTurn`;
        if (scores.isPresent()) {
            const score0: number = scores.get().get(Player.ZERO);
            const score1: number = scores.get().get(Player.ONE);
            endpoint += `&score0=${score0}&score1=${score1}`;
        }
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    /** End the game with a draw */
    public async draw(gameId: string, scores: MGPOptional<PlayerNumberMap>): Promise<void> {
        let endpoint: string = `game/${gameId}?action=draw`;
        if (scores.isPresent()) {
            const score0: number = scores.get().get(Player.ZERO);
            const score1: number = scores.get().get(Player.ONE);
            endpoint += `&score0=${score0}&score1=${score1}`;
        }
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    /** End the game with a victory */
    public async victory(gameId: string,
                         scores: MGPOptional<PlayerNumberMap>,
                         winner: MinimalUser,
                         loser: MinimalUser)
    : Promise<void>
    {
        const winnerURLEncoded: string = encodeURIComponent(JSON.stringify(winner));
        const loserURLEncoded: string = encodeURIComponent(JSON.stringify(loser));
        let endpoint: string = `game/${gameId}?action=victory&winner=${winnerURLEncoded}&loser=${loserURLEncoded}`;
        if (scores.isPresent()) {
            const score0: number = scores.get().get(Player.ZERO);
            const score1: number = scores.get().get(Player.ONE);
            endpoint += `&score0=${score0}&score1=${score1}`;
        }
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    /** Play a move */
    public async move(gameId: string,
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

    /** Play a final move */
    public async moveAndEnd(gameId: string,
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

    /** Retrieve the current time of the server */
    public async getServerTime(): Promise<number> {
        const endpoint: string = `time`;
        const result: MGPFallible<JSONValue> = await this.performRequestWithJSONResponse('GET', endpoint);
        this.assertSuccess(result);
        // eslint-disable-next-line dot-notation
        return Utils.getNonNullable(result.get())['time'] as number;
    }

    /** Joins a game */
    public async joinGame(gameId: string): Promise<MGPValidation> {
        const endpoint: string = `config-room/${gameId}/candidates`;
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        if (result.isSuccess()) {
            return MGPValidation.SUCCESS;
        } else {
            Utils.assert(result.getReason() === 'Game does not exist', 'Unexpected failure from backend');
            return MGPValidation.failure($localize`Game does not exist`);
        }
    }

    /** Remove a candidate from a config room (it can be ourselves or someone else) */
    public async removeCandidate(gameId: string, candidateId: string): Promise<void> {
        const endpoint: string = `config-room/${gameId}/candidates/${candidateId}`;
        const result: MGPFallible<Response> = await this.performRequest('DELETE', endpoint);
        this.assertSuccess(result);
    }

    /** Propose a config to the opponent */
    public async proposeConfig(gameId: string, config: Partial<ConfigRoom>): Promise<void> {
        const configEncoded: string = encodeURIComponent(JSON.stringify(config));
        const endpoint: string = `config-room/${gameId}?action=propose&config=${configEncoded}`;
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    /** Select an opponent */
    public async selectOpponent(gameId: string, opponent: MinimalUser): Promise<void> {
        const opponentEncoded: string = encodeURIComponent(JSON.stringify(opponent));
        const endpoint: string = `config-room/${gameId}?action=selectOpponent&opponent=${opponentEncoded}`;
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    /** Review a config proposed to the opponent */
    public async reviewConfig(gameId: string): Promise<void> {
        const endpoint: string = `config-room/${gameId}?action=reviewConfig`;
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    /** Review a config proposed to the opponent, who just left */
    public async reviewConfigAndRemoveChosenOpponent(gameId: string): Promise<void> {
        const endpoint: string = `config-room/${gameId}?action=reviewConfigAndRemoveOpponent`;
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

}
