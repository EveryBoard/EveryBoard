import { Injectable } from '@angular/core';

import { FirestoreDocument } from '../dao/FirestoreDAO';
import { UserDAO } from '../dao/UserDAO';
import { User } from '../domain/User';

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

    public constructor(private readonly userDAO: UserDAO)
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
}
