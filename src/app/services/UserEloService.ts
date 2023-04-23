import { Injectable } from '@angular/core';
import { UserDAO } from '../dao/UserDAO';
import { EloHistory } from '../domain/EloInfo';

@Injectable({
    providedIn: 'root',
})
export class UserEloService {

    constructor(private readonly userDAO: UserDAO) {}

    /**
     * @param userId the id of the user
     * @param gameName the name of the game
     * @param elo the new elo value for player
     * @returns a promise
     */
    public async addEloHistory(userId: string, gameName: string, elo: number): Promise<void> {
        return this.userDAO.subCollectionDAO(userId, 'messages').set(partId, message);
    }
}