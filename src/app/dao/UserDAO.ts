import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';
import { display } from 'src/app/utils/utils';
import { User } from '../domain/User';

@Injectable({
    providedIn: 'root',
})
export class UserDAO extends FirebaseFirestoreDAO<User> {
    public static VERBOSE: boolean = false;

    public static COLLECTION_NAME: string = 'joueurs';

    constructor(protected afs: AngularFirestore) {
        super(UserDAO.COLLECTION_NAME, afs);
        display(UserDAO.VERBOSE, 'JoueursDAO.constructor');
    }
    public async usernameIsAvailable(username: string): Promise<boolean> {
        return (await this.afs.collection<User>(UserDAO.COLLECTION_NAME).ref
            .where('username', '==', username).limit(1).get()).empty;
    }
    public async setUsername(uid: string, username: string): Promise<void> {
        await this.update(uid, { username: username });
    }
    public async markVerified(uid: string): Promise<void> {
        await this.update(uid, { verified: true });
    }
    public observeUserByUsername(username: string, callback: FirebaseCollectionObserver<User>): () => void {
        return this.observingWhere([['username', '==', username], ['verified', '==', true]], callback);
    }
    public observeActiveUsers(callback: FirebaseCollectionObserver<User>): () => void {
        return this.observingWhere([['state', '==', 'online'], ['verified', '==', true]], callback);
    }
}
