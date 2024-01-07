import { Injectable } from '@angular/core';
import { ConnectedUserService } from './ConnectedUserService';
import { JSONValue, Utils } from '../utils/utils';
import { environment } from 'src/environments/environment';
import { MGPFallible } from '../utils/MGPFallible';
import { MGPOptional } from '../utils/MGPOptional';
import { Part, RequestType } from '../domain/Part';
import { MinimalUser } from '../domain/MinimalUser';

type HTTPMethod = 'POST' | 'GET' | 'PATCH' | 'HEAD' | 'DELETE';

@Injectable({
    providedIn: 'root',
})
export class BackendService {
    public constructor(private readonly connectedUserService: ConnectedUserService) {
    }

    private async performRequest(method: HTTPMethod, endpoint: string): Promise<MGPFallible<Response>> {
        const token: string = await this.connectedUserService.getIdToken();
        const response: Response =
            await fetch(environment.backendURL + '/' + endpoint, {
                method,
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
            });
        if (this.isSuccessStatus(response.status)) {
            console.log('success')
            return MGPFallible.success(response);
        } else {
            console.log('error')
            try {
                const jsonResponse: JSONValue = await response.json();
                const error: string = (jsonResponse != null && (jsonResponse['message'] as string)) || 'No error message';
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
        return Utils.getNonNullable(result.get())['id'] as string;
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
        const endpoint: string = `game/${gameId}?action=resign&winner=${winnerURLEncoded}&loser=${loserURLEncoded}`;
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
    public async endTurn(gameId: string, scores: MGPOptional<readonly [number, number]>): Promise<void> {
        let endpoint: string = `game/${gameId}?action=endTurn`;
        if (scores.isPresent()) {
            const score0: number = scores.get()[0];
            const score1: number = scores.get()[1];
            endpoint += `&score0=${score0}&score1=${score1}`;
        }
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    /** End the game with a draw */
    public async draw(gameId: string, scores: MGPOptional<readonly [number, number]>): Promise<void> {
        let endpoint: string = `game/${gameId}?action=draw`;
        if (scores.isPresent()) {
            const score0: number = scores.get()[0];
            const score1: number = scores.get()[1];
            endpoint += `&score0=${score0}&score1=${score1}`;
        }
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    /** End the game with a victory */
    public async victory(gameId: string,
                         scores: MGPOptional<readonly [number, number]>,
                         winner: MinimalUser,
                         loser: MinimalUser): Promise<void> {
        const winnerURLEncoded: string = encodeURIComponent(JSON.stringify(winner));
        const loserURLEncoded: string = encodeURIComponent(JSON.stringify(loser));
        let endpoint: string = `game/${gameId}?action=victory&winer=${winnerURLEncoded}&loser=${loserURLEncoded}`;
        if (scores.isPresent()) {
            const score0: number = scores.get()[0];
            const score1: number = scores.get()[1];
            endpoint += `&score0=${score0}&score1=${score1}`;
        }
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }

    /** Play a move */
    public async move(gameId: string, move: JSONValue): Promise<void> {
        const moveURLEncoded: string = encodeURIComponent(JSON.stringify(move));
        const endpoint: string = `game/${gameId}&move=${moveURLEncoded}`;
        const result: MGPFallible<Response> = await this.performRequest('POST', endpoint);
        this.assertSuccess(result);
    }
}
