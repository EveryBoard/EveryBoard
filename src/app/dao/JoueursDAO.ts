import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IJoueur } from '../domain/iuser';
import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';
import { display } from 'src/app/utils/utils';

@Injectable({
    providedIn: 'root',
})
export class JoueursDAO extends FirebaseFirestoreDAO<IJoueur> {
    public static VERBOSE: boolean = false;

    constructor(protected afs: AngularFirestore) {
        super('joueurs', afs);
        display(JoueursDAO.VERBOSE, 'JoueursDAO.constructor');
    }
    public async usernameIsAvailable(username: string): Promise<boolean> {
        return (await this.afs.collection<IJoueur>('joueurs').ref.where('pseudo', '==', username).limit(1).get()).empty;
    }
    public async getUsername(uid: string): Promise<string> {
        return (await this.read(`${uid}`)).pseudo;
    }
    public observeUserByPseudo(pseudo: string, callback: FirebaseCollectionObserver<IJoueur>): () => void {
        return this.observingWhere('pseudo', '==', pseudo, callback);
    }
    public observeActivesUsers(callback: FirebaseCollectionObserver<IJoueur>): () => void {
        return this.observingWhere('state', '==', 'online', callback);
    }
}
