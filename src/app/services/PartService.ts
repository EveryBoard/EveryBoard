import { Injectable } from '@angular/core';
import { serverTimestamp } from 'firebase/firestore';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { FirestoreDocument } from '../dao/FirestoreDAO';
import { PartDAO } from '../dao/PartDAO';
import { Action, PartEvent, PartEventMove, Reply, RequestType } from '../domain/Part';
import { Player } from '../jscaip/Player';
import { MGPOptional } from '../utils/MGPOptional';
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
            await this.eventsCollection(partId).findWhere([['eventType', '==', 'Move']], 'time');
        return moveEvents.map((eventDoc: FirestoreDocument<PartEvent>) =>
            decoder((eventDoc.data as PartEventMove).move));
    }
    public async getLastMoveDoc(partId: string): Promise<FirestoreDocument<PartEventMove>> {
        const results: FirestoreDocument<PartEvent>[] =
            await this.eventsCollection(partId).findWhere([['eventType', '==', 'Move']], 'time', 1);
        Utils.assert(results.length === 1, `There should be exactly one last move, found ${results.length}`);
        return results[0] as FirestoreDocument<PartEventMove>;
    }
    public async getLastEventDoc(partId: string): Promise<MGPOptional<FirestoreDocument<PartEvent>>> {
        const results: FirestoreDocument<PartEvent>[] =
            await this.eventsCollection(partId).findWhere([], 'time', 1);
        if (results.length === 0) {
            return MGPOptional.empty();
        } else {
            return MGPOptional.of(results[0]);
        }
    }
    public async getLastEvent(partId: string): Promise<MGPOptional<PartEvent>> {
        return (await this.getLastEventDoc(partId)).map((doc: FirestoreDocument<PartEvent>) => doc.data);
    }
    public addRequest(partId: string, player: Player, requestType: RequestType): Promise<string> {
        Utils.assert(player.value === 0 || player.value === 1, 'player should be player 0 or 1');
        return this.addEvent(partId, {
            eventType: 'Request',
            time: serverTimestamp(),
            player: player.value as 0|1,
            requestType,
        });
    }
    public addReply(partId: string, player: Player, reply: Reply, requestType: RequestType, data: JSONValue = null): Promise<string> {
        Utils.assert(player.value === 0 || player.value === 1, 'player should be player 0 or 1');
        return this.addEvent(partId, {
            eventType: 'Reply',
            time: serverTimestamp(),
            player: player.value as 0|1,
            reply,
            requestType,
            data,
        });
    }
    public startGame(partId: string, player: Player): Promise<string> {
        console.log('PARTSERVICE STARTGAME')
        return this.addAction(partId, player, 'StartGame');
    }
    public addAction(partId: string, player: Player, action: Action): Promise<string> {
        Utils.assert(player.value === 0 || player.value === 1, 'player should be player 0 or 1');
        return this.addEvent(partId, {
            eventType: 'Action',
            time: serverTimestamp(),
            player: player.value as 0|1,
            action,
        });
    }
    public subscribeToEvents(partId: string, callback: (events: PartEvent[]) => void) {
        const internalCallback: FirestoreCollectionObserver<PartEvent> = new FirestoreCollectionObserver(
            (events: FirestoreDocument<PartEvent>[]) => {
                const realEvents: PartEvent[] = [];
                for (const eventDoc of events) {
                    if (eventDoc.data.time == null) {
                        // When we add an event, firebase will initially have a null timestamp for the document creator
                        // When the event is really written, we receive a modification with the real timestamp
                        continue;
                    }
                    realEvents.push(eventDoc.data);
                }
                callback(realEvents);
            },
            (events: FirestoreDocument<PartEvent>[]) => {
                // Events can't be modified
                // The only modification is when firebase adds the timestamp.
                // So all modifications are actually treated as creations, as we ignore creations with empty timestamps
                callback(events.map((event: FirestoreDocument<PartEvent>) => event.data));
            },
            () => {
                // Events can't be deleted,
            });
        return this.eventsCollection(partId).observingWhere([], internalCallback, 'time');
    }
}
