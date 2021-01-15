import { FirebaseFirestoreDAO } from '../firebasefirestoredao/FirebaseFirestoreDAO';
import { ICurrentPart, MGPResult, PICurrentPart } from '../../domain/icurrentpart';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { environment } from 'src/environments/environment';
import { display } from 'src/app/collectionlib/utils';

@Injectable({
    providedIn: 'root',
})
export class PartDAO extends FirebaseFirestoreDAO<ICurrentPart, PICurrentPart> {
    public static VERBOSE = false;

    constructor(protected afs: AngularFirestore) {
        super('parties', afs);
        if (environment.test) throw new Error('NO PART DAO IN TEST');
        display(PartDAO.VERBOSE, 'PartDAO.constructor');
    }
    public observeActivesParts(callback: FirebaseCollectionObserver<ICurrentPart>): () => void {
        return this.observingWhere('result', '==', MGPResult.UNACHIEVED.toInterface(), callback);
    }
}
