import { Injectable } from '@angular/core';
import { serverTimestamp } from 'firebase/firestore';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { FirestoreDocument } from '../dao/FirestoreDAO';
import { PartDAO } from '../dao/PartDAO';
import { PartEvent, PartEventMove } from '../domain/Part';
import { Player } from '../jscaip/Player';
import { JSONValue, Utils } from '../utils/utils';

@Injectable({
    providedIn: 'root',
})
export class PartService {

    public constructor(private readonly partDAO: PartDAO) {}

    private eventsCollection(partId: string) {
        return this.partDAO.subCollectionDAO<PartEvent>(partId, 'events');
    }
    private addEvent(partId: string, event: PartEvent): Promise<string> {
        return this.eventsCollection(partId).create(event);
    }
    public addMove(partId: string, player: Player, move: JSONValue): Promise<string> {
        Utils.assert(player.value === 0 || player.value === 1, 'player should be player 0 or 1');
        return this.addEvent(partId, {
            eventType: 'Move',
            time: serverTimestamp(),
            player: player.value as 0|1,
            move,
        });
    }
    public async getAllMoves<M>(partId: string, decoder: (move: JSONValue) => M): Promise<M[]> {
        const moveEvents: FirestoreDocument<PartEvent>[] =
            await this.eventsCollection(partId).findWhere([['type', '==', 'Move']], 'time');
        return moveEvents.map((eventDoc: FirestoreDocument<PartEvent>) =>
            decoder((eventDoc.data as PartEventMove).move));
    }
    public async getLastMoveDoc(partId: string): Promise<FirestoreDocument<PartEventMove>> {
        const results: FirestoreDocument<PartEvent>[] =
            await this.eventsCollection(partId).findWhere([['type', '==', 'Move']], 'time', 1);
        Utils.assert(results.length === 1, 'There should be exactly one last move');
        return results[0] as FirestoreDocument<PartEventMove>;
    }
    public subscribeToEvents(partId: string, callback: (event: PartEvent) => void) {
        const internalCallback: FirestoreCollectionObserver<PartEvent> = new FirestoreCollectionObserver(
            (events: FirestoreDocument<PartEvent>[]) => {
                for (const eventDoc of events) {
                    callback(eventDoc.data);
                }
            },
            () => {
                // Events can't be modified
            },
            () => {
                // Events can't be deleted,
            });
        return this.eventsCollection(partId).observingWhere([], internalCallback, 'time');
    }
}
