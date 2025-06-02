import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameServiceMock {

    public async createGame(_gameName: string): Promise<string> {
        return 'gameId';
    }
}
