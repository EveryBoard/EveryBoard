import { Injectable } from '@angular/core';
import { ConnectedUserService } from './ConnectedUserService';
import { JSONValue, Utils } from '../utils/utils';
import { environment } from 'src/environments/environment';
import { MGPFallible } from '../utils/MGPFallible';
import { MGPOptional } from '../utils/MGPOptional';

type HTTPMethod = 'POST' | 'GET' | 'PATCH' | 'HEAD';

@Injectable({
    providedIn: 'root',
})
export class BackendService {
    public constructor(private readonly connectedUserService: ConnectedUserService) {
    }

    private async performRequest(method: HTTPMethod, endpoint: string): Promise<MGPFallible<JSONValue>> {
        const token: string = await this.connectedUserService.getIdToken();
        const result: Response =
            await fetch(environment.backendURL + '/' + endpoint, {
                method,
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
            });
        const jsonResult: JSONValue = await result.json();
        if (this.isSuccessStatus(result.status)) {
            return MGPFallible.success(jsonResult);
        } else {
            console.log(jsonResult)
            // eslint-disable-next-line dot-notation
            const error: string = (jsonResult != null && (jsonResult['message'] as string)) || 'No error message';
            return MGPFallible.failure(error);
        }
    }

    private isSuccessStatus(status: number): boolean {
        return status >= 200 && status <= 299;
    }

    private assertSuccess(result: MGPFallible<JSONValue>): void {
        // TODO: better error handling?
        Utils.assert(result.isSuccess(), 'Unexpected error from backend: ' + result.getReasonOr(''));
    }

    /**
     * Create a game, its config room and chat. Return the id of the created game.
     */
    public async createGame(gameName: string): Promise<string> {
        const result: MGPFallible<JSONValue> = await this.performRequest('POST', `game?gameName=${gameName}`);
        this.assertSuccess(result);
        // eslint-disable-next-line dot-notation
        return Utils.getNonNullable(result.get())['id'] as string;
    }

    /**
     * Retrieve the name of the game with the given id. If there is no corresponding game, returns an empty option.
     */
    public async getGameName(gameId: string): Promise<MGPOptional<string>> {
        const result: MGPFallible<JSONValue> = await this.performRequest('GET', `game/${gameId}?onlyGameName`);
        console.log(result)
        if (result.isSuccess()) {
            const gameName: string = Utils.getNonNullable(result.get())['gameName'] as string;
            console.log(gameName)
            return MGPOptional.of(gameName);
        } else {
            return MGPOptional.empty();
        }
    }
}
