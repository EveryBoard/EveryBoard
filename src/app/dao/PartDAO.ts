import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { MGPResult, IPart } from '../domain/icurrentpart';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';
import { display } from 'src/app/utils/utils';

@Injectable({
    providedIn: 'root',
})
export class PartDAO extends FirebaseFirestoreDAO<IPart> {

    public static VERBOSE: boolean = false;

    constructor(protected afs: AngularFirestore) {
        super('parties', afs);
        display(PartDAO.VERBOSE, 'PartDAO.constructor');
    }
    public observeActiveParts(callback: FirebaseCollectionObserver<IPart>): () => void {
        return this.observingWhere([['result', '==', MGPResult.UNACHIEVED.value]], callback);
    }
    public async userHasActivePart(username: string): Promise<boolean> {
        // This can be simplified into a simple query once part.playerZero and part.playerOne are in an array
        const partsAsPlayerZero: IPart[] = await this.findWhere([
            ['playerZero', '==', username],
            ['result', '==', MGPResult.UNACHIEVED.value]]);
        const partsAsPlayerOne: IPart[] = await this.findWhere([
            ['playerOne', '==', username],
            ['result', '==', MGPResult.UNACHIEVED.value]]);
        return partsAsPlayerZero.length > 0 || partsAsPlayerOne.length > 0;
    }
}
