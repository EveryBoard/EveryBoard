import { Injectable } from '@angular/core';
import { FirestoreDocument, FirestoreDAO } from './FirestoreDAO';
import { FirestoreCollectionObserver } from './FirestoreCollectionObserver';
import { serverTimestamp } from 'firebase/firestore';
import { display } from 'src/app/utils/utils';
import { User } from '../domain/User';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
export class UserDAO extends FirestoreDAO<User> {

    public static VERBOSE: boolean = false;

    public static COLLECTION_NAME: string = 'users';

    constructor(firestore: Firestore) {
        super(UserDAO.COLLECTION_NAME, firestore);
        display(UserDAO.VERBOSE, 'UserDAO.constructor');
    }
    public async usernameIsAvailable(username: string): Promise<boolean> {
        const usersWithSameUsername: FirestoreDocument<User>[] = await this.findWhere([['username', '==', username]]);
        return usersWithSameUsername.length === 0;
    }
    public async setUsername(uid: string, username: string): Promise<void> {
        await this.update(uid, { username: username });
    }
    public async markAsVerified(uid: string): Promise<void> {
        await this.update(uid, { verified: true });
    }
    public observeUserByUsername(username: string, callback: FirestoreCollectionObserver<User>): () => void {
        return this.observingWhere([['username', '==', username]], callback);
    }
    public observeActiveUsers(callback: FirestoreCollectionObserver<User>): () => void {
        return this.observingWhere([['state', '==', 'online'], ['verified', '==', true]], callback);
    }
    public updatePresenceToken(userId: string): Promise<void> {
        return this.update(userId, {
            lastUpdateTime: serverTimestamp(),
        });
    }
}
