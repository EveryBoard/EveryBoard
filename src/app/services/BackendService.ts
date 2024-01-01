import { Injectable } from '@angular/core';
import { ConnectedUserService } from './ConnectedUserService';
import { JSONValue, Utils } from '../utils/utils';
import { environment } from 'src/environments/environment';
import { MGPFallible } from '../utils/MGPFallible';

@Injectable({
    providedIn: 'root',
})
export class BackendService {
    public constructor(private readonly connectedUserService: ConnectedUserService) {
    }

    private async performRequest(method: 'POST' | 'GET' | 'PATCH', endpoint: string): Promise<MGPFallible<JSONValue>> {
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

    public async createGame(gameName: string): Promise<string> {
        const result: MGPFallible<JSONValue> = await this.performRequest('POST', `game?gameName=${gameName}`);
        this.assertSuccess(result);
        // eslint-disable-next-line dot-notation
        return Utils.getNonNullable(result.get())['id'] as string;
    }
}
