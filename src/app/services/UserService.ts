import { Utils, MGPOptional } from '@everyboard/lib';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserDAO } from '../dao/UserDAO';
import { User } from '../domain/User';
import { FirestoreTime } from '../domain/Time';
import { FirestoreDocument, IFirestoreDAO } from '../dao/FirestoreDAO';
import { serverTimestamp } from 'firebase/firestore';
import { MinimalUser } from '../domain/MinimalUser';
import { EloCalculationService, EloEntry, EloInfoPair } from './EloCalculationService';
import { EloInfo } from '../domain/EloInfo';
import { UserEloService } from './UserEloService';
import { PlayerMap } from '../jscaip/PlayerMap';

/**
  * The aim of this service is to:
  *     A. subscribe to other users to see if they are online in those contexts:
  *         1. The candidates when you are creator in PartCreation
  *         2. The creator when you are candidate in PartCreation
  *         3. Your opponent when you are playing
  *     B. subscribe to yourself in the header for multitab purpose
  */
@Injectable({
    providedIn: 'root',
})
export class UserService {

    public constructor(private readonly userDAO: UserDAO,
                       private readonly userEloService: UserEloService)
    {
    }

    public async usernameIsAvailable(username: string): Promise<boolean> {
        const usersWithSameUsername: FirestoreDocument<User>[] = await this.userDAO.findWhere([['username', '==', username]]);
        return usersWithSameUsername.length === 0;
    }

    public async setUsername(uid: string, username: string): Promise<void> {
        await this.userDAO.update(uid, { username: username });
    }

    public async markAsVerified(uid: string): Promise<void> {
        await this.userDAO.update(uid, { verified: true });
    }

    /**
     * Observes an user, ignoring local updates.
     */
    public observeUserOnServer(userId: string, callback: (user: MGPOptional<User>) => void): Subscription {
        return this.userDAO.subscribeToChanges(userId, (user: MGPOptional<User>): void => {
            if (user.isPresent() && user.get().lastUpdateTime === null) {
                // Ignore this update as it does not come from firebase but from ourselves
                // We will get the firebase update later.
                return;
            }
            callback(user);
        });
    }

    public async getUserLastUpdateTime(id: string): Promise<MGPOptional<FirestoreTime>> {
        const user: MGPOptional<User> = await this.userDAO.read(id);
        if (user.isAbsent()) {
            return MGPOptional.empty();
        } else {
            const lastUpdateTime: FirestoreTime | undefined = user.get().lastUpdateTime;
            Utils.assert(lastUpdateTime != null, 'should not receive a lastUpdateTime equal to null');
            return MGPOptional.of(lastUpdateTime as FirestoreTime);
        }
    }

    public updatePresenceToken(userId: string): Promise<void> {
        return this.userDAO.update(userId, {
            lastUpdateTime: serverTimestamp(),
        });
    }

    public async updateElo(gameName: string, zero: MinimalUser, one: MinimalUser, winner: 'ZERO' | 'ONE' | 'DRAW')
    : Promise<void>
    {
        // For both user: increment the number of game played
        const playerZero: EloInfo = await this.getPlayerInfo(zero, gameName);
        const playerOne: EloInfo = await this.getPlayerInfo(one, gameName);
        // Calculate the game result
        const eloEntry: EloEntry = {
            eloInfoPair: PlayerMap.ofValues(playerZero, playerOne),
            winner,
        };
        const result: EloInfoPair = EloCalculationService.getNewElos(eloEntry);
        // For both user: change the Elo
        await this.updatePlayerElo(zero, gameName, result[0]);
        await this.updatePlayerElo(one, gameName, result[1]);
    }

    public async getPlayerInfo(player: MinimalUser, gameName: string): Promise<EloInfo> {
        console.log('getPlayerInfo', player, gameName)
        const subCollection: IFirestoreDAO<EloInfo> = this.userDAO.subCollectionDAO<EloInfo>(player.id, 'elos');
        console.log('subco, on est bon !')
        const optionalInfo: MGPOptional<EloInfo> = await subCollection.read(gameName);
        console.log('lu!')
        return optionalInfo.getOrElse({
            currentElo: 0,
            numberOfGamePlayed: 0,
        });
    }

    private async updatePlayerElo(player: MinimalUser, gameName: string, newEloInfo: EloInfo): Promise<void> {
        return this.userEloService.update(player.id, gameName, newEloInfo);
    }

}
