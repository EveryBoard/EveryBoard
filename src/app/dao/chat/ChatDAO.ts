import {IChat, PIChat, IChatId} from '../../domain/ichat';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FirebaseFirestoreDAO} from '../firebasefirestoredao/FirebaseFirestoreDAO';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {display} from 'src/app/collectionlib/utils';

@Injectable({
    providedIn: 'root',
})
export class ChatDAO extends FirebaseFirestoreDAO<IChat, PIChat> {
    public static VERBOSE: boolean = false;

    constructor(protected afs: AngularFirestore) {
        super('chats', afs);
        if (environment.test) throw new Error('NO CHAT DAO IN TEST');
        display(ChatDAO.VERBOSE, 'ChatDAO.constructor');
    }
}
