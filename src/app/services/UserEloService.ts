import { Injectable } from '@angular/core';
import { UserDAO } from '../dao/UserDAO';
import { EloInfo } from '../domain/EloInfo';

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
    public async update(userId: string, gameName: string, newEloInfo: EloInfo): Promise<void> {
        console.log("====== UserEloService.update(", userId, gameName, newEloInfo, ")")
        return this.userDAO.subCollectionDAO<EloInfo>(userId, 'elos').set(gameName, newEloInfo);
    }
}
