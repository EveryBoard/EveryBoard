import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {IJoueur, PIJoueur} from '../../domain/iuser';
import {FirebaseFirestoreDAO} from '../firebasefirestoredao/FirebaseFirestoreDAO';
import {FirebaseCollectionObserver} from '../FirebaseCollectionObserver';
import {environment} from 'src/environments/environment';
import {display} from 'src/app/collectionlib/utils';

@Injectable({
    providedIn: 'root',
})
export class JoueursDAO extends FirebaseFirestoreDAO<IJoueur, PIJoueur> {
    public static VERBOSE: boolean = false;

    constructor(protected afs: AngularFirestore) {
        super('joueurs', afs);
        if (environment.test) throw new Error('NO JOUEUR DAO IN TEST');
        display(JoueursDAO.VERBOSE, 'JoueursDAO.constructor');
    }
    public observeUserByPseudo(pseudo: string, callback: FirebaseCollectionObserver<IJoueur>): () => void {
        return this.observingWhere('pseudo', '==', pseudo, callback);
    }
    public observeActivesUsers(callback: FirebaseCollectionObserver<IJoueur>): () => void {
        return this.observingWhere('state', '==', 'online', callback);
    }
}
