import { FirestoreDocument, FirestoreDAO } from './FirestoreDAO';
import { MGPResult, Part } from '../domain/Part';
import { Injectable } from '@angular/core';
import { FirestoreCollectionObserver } from './FirestoreCollectionObserver';
import { display } from 'src/app/utils/utils';
import { Player } from '../jscaip/Player';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
export class PartDAO extends FirestoreDAO<Part> {

    public static VERBOSE: boolean = false;

    constructor(firestore: Firestore) {
        super('parties', firestore);
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
    public observeActiveParts(callback: FirestoreCollectionObserver<Part>): () => void {
        return this.observingWhere([['result', '==', MGPResult.UNACHIEVED.value]], callback);
    }
    public async userHasActivePart(username: string): Promise<boolean> {
        // This can be simplified into a simple query once part.playerZero and part.playerOne are in an array
        const userIsFirstPlayer: FirestoreDocument<Part>[] = await this.findWhere([
            ['playerZero', '==', username],
            ['result', '==', MGPResult.UNACHIEVED.value]]);
        const userIsSecondPlayer: FirestoreDocument<Part>[] = await this.findWhere([
            ['playerOne', '==', username],
            ['result', '==', MGPResult.UNACHIEVED.value]]);
        return userIsFirstPlayer.length > 0 || userIsSecondPlayer.length > 0;
    }
}
