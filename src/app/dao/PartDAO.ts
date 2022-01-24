import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { MGPResult, Part } from '../domain/Part';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { FirebaseCollectionObserver } from './FirebaseCollectionObserver';
import { display } from 'src/app/utils/utils';
import { Player } from '../jscaip/Player';

@Injectable({
    providedIn: 'root',
})
export class PartDAO extends FirebaseFirestoreDAO<Part> {

    public static VERBOSE: boolean = false;

    constructor(protected afs: AngularFirestore) {
        super('parties', afs);
        display(PartDAO.VERBOSE, 'PartDAO.constructor');
    }
    public async updateAndBumpIndex(id: string,
                                    user: Player,
                                    lastIndex: number,
                                    update: Partial<Part>)
    : Promise<void>
    {
        update = {
            ...update,
            lastUpdate: {
                index: lastIndex + 1,
                player: user.value,
            },
        };
        return this.update(id, update);
    }
    public observeActiveParts(callback: FirebaseCollectionObserver<Part>): () => void { // TODOTODO activeParts
        return this.observingWhere([['result', '==', MGPResult.UNACHIEVED.value]], callback);
    }
    public async userHasActivePart(username: string): Promise<boolean> {
        // This can be simplified into a simple query once part.playerZero and part.playerOne are in an array
        const userIsFirstPlayer: Part[] = await this.findWhere([
            ['playerZero', '==', username],
            ['result', '==', MGPResult.UNACHIEVED.value]]);
        const userIsSecondPlayer: Part[] = await this.findWhere([
            ['playerOne', '==', username],
            ['result', '==', MGPResult.UNACHIEVED.value]]);
        return userIsFirstPlayer.length > 0 || userIsSecondPlayer.length > 0;
    }
}
