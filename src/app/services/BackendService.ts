import { Injectable } from '@angular/core';
import { ConnectedUserService } from './ConnectedUserService';
import { JSONValue, Utils } from '../utils/utils';
import { environment } from 'src/environments/environment';
import { MGPFallible } from '../utils/MGPFallible';
import { MGPOptional } from '../utils/MGPOptional';
import { Part } from '../domain/Part';

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

    /** Accept a game config */
    public async acceptConfig(gameId: string): Promise<void> {
        const result: MGPFallible<Response> = await this.performRequest('POST', `game/${gameId}?action=acceptConfig`);
        this.assertSuccess(result);
    }

    /** Give the current player resignation in a game */
    public async resign(gameId: string): Promise<void> {
        const result: MGPFallible<Response> = await this.performRequest('POST', `game/${gameId}?action=resign`);
        this.assertSuccess(result);
    }
}
