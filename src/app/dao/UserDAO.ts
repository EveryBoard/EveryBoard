import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IJoueur } from '../domain/iuser';
import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';
import { display } from 'src/app/utils/utils';

@Injectable({
    providedIn: 'root',
})
export class UserDAO extends FirebaseFirestoreDAO<IJoueur> {
    public static VERBOSE: boolean = false;

    public static COLLECTION_NAME: string = 'joueurs';

    constructor(protected afs: AngularFirestore) {
        super(UserDAO.COLLECTION_NAME, afs);
        display(UserDAO.VERBOSE, 'JoueursDAO.constructor');
    }
    public async usernameIsAvailable(username: string): Promise<boolean> {
        return (await this.afs.collection<IJoueur>(UserDAO.COLLECTION_NAME).ref.where('username', '==', username).limit(1).get()).empty;
    }
    public async getUsername(uid: string): Promise<string> {
        return (await this.read(uid)).username;
    }
    public async setUsername(uid: string, username: string): Promise<void> {
        await this.update(uid, { username: username });
    }
    public observeUserByUsername(username: string, callback: FirebaseCollectionObserver<IJoueur>): () => void {
        return this.observingWhere('username', '==', username, callback);
    }
    public observeActivesUsers(callback: FirebaseCollectionObserver<IJoueur>): () => void {
        return this.observingWhere('state', '==', 'online', callback);
    }
}
