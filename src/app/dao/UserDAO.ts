import { Injectable } from '@angular/core';
import { serverTimestamp } from 'firebase/firestore';
import { FirebaseDocument, FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';
import { display } from 'src/app/utils/utils';
import { User } from '../domain/User';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
export class UserDAO extends FirebaseFirestoreDAO<User> {

    public static VERBOSE: boolean = false;

    public static COLLECTION_NAME: string = 'joueurs';

    constructor(firestore: Firestore) {
        super(UserDAO.COLLECTION_NAME, firestore);
        display(UserDAO.VERBOSE, 'UserDAO.constructor');
    }
    public async usernameIsAvailable(username: string): Promise<boolean> {
        const usersWithSameUsername: FirebaseDocument<User>[] = await this.findWhere([['username', '==', username]]);
        return usersWithSameUsername.length === 0;
    }
    public async setUsername(uid: string, username: string): Promise<void> {
        await this.update(uid, { username: username });
    }
    public async markVerified(uid: string): Promise<void> {
        await this.update(uid, { verified: true });
    }
    public observeUserByUsername(username: string, callback: FirebaseCollectionObserver<User>): () => void {
        return this.observingWhere([['username', '==', username]], callback);
    }
    public observeActiveUsers(callback: FirebaseCollectionObserver<User>): () => void {
        return this.observingWhere([['state', '==', 'online'], ['verified', '==', true]], callback);
    }
    public updatePresenceToken(userId: string): Promise<void> {
        return this.update(userId, {
            last_changed: serverTimestamp(),
        });
    }
}
