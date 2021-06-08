import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { MGPResult, IPart } from '../domain/icurrentpart';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';
import { environment } from 'src/environments/environment';
import { display } from 'src/app/utils/utils';

@Injectable({
    providedIn: 'root',
})
export class PartDAO extends FirebaseFirestoreDAO<IPart> {
    public static VERBOSE: boolean = false;

    constructor(protected afs: AngularFirestore) {
        super('parties', afs);
        if (environment.test) throw new Error('NO PART DAO IN TEST');
        display(PartDAO.VERBOSE, 'PartDAO.constructor');
    }
    public observeActivesParts(callback: FirebaseCollectionObserver<IPart>): () => void {
        return this.observingWhere('result', '==', MGPResult.UNACHIEVED.value, callback);
    }
}
