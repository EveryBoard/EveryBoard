
import { Injectable } from '@angular/core';
import { serverTimestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { FirestoreDocument, IFirestoreDAO } from '../dao/FirestoreDAO';
import { PartDAO } from '../dao/PartDAO';
import { Action, PartEvent, Reply, RequestType } from '../domain/Part';
import { Player } from '../jscaip/Player';
import { JSONValue } from '../utils/utils';

@Injectable({
    providedIn: 'root',
})
export class GameEventService {

    public constructor(private readonly partDAO: PartDAO) {}

    private eventsCollection(partId: string): IFirestoreDAO<PartEvent> {
        return this.partDAO.subCollectionDAO<PartEvent>(partId, 'events');
    }
    private addEvent(partId: string, event: PartEvent): Promise<string> {
        return this.eventsCollection(partId).create(event);
    }
    public addMove(partId: string, player: Player, move: JSONValue): Promise<string> {
        return this.addEvent(partId, {
            eventType: 'Move',
            time: serverTimestamp(),
            player: player.value as 0|1,
            move,
        });
    }
    public addRequest(partId: string, player: Player, requestType: RequestType): Promise<string> {
        return this.addEvent(partId, {
            eventType: 'Request',
            time: serverTimestamp(),
            player: player.value as 0|1,
            requestType,
        });
    }
    public addReply(partId: string,
                    player: Player,
                    reply: Reply,
                    requestType: RequestType,
                    data: JSONValue = null)
    : Promise<string>
    {
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
        return this.addAction(partId, player, 'StartGame');
    }
    public addAction(partId: string, player: Player, action: Action): Promise<string> {
        return this.addEvent(partId, {
            eventType: 'Action',
            time: serverTimestamp(),
            player: player.value as 0|1,
            action,
        });
    }
    public subscribeToEvents(partId: string, callback: (events: PartEvent[]) => void): Subscription {
        const internalCallback: FirestoreCollectionObserver<PartEvent> = new FirestoreCollectionObserver(
            (events: FirestoreDocument<PartEvent>[]) => {
                // When the client adds an event, firebase will initially have a null timestamp for the document creator
                // When the event is really written, all the clients receive a modification with the real timestamp
                // We want to keep only the latter.
                const realEvents: PartEvent[] = events
                    .map((event: FirestoreDocument<PartEvent>) => event.data)
                    .filter((event: PartEvent) => event.time != null);
                if (realEvents.length > 0) {
                    callback(realEvents);
                }
            },
            (events: FirestoreDocument<PartEvent>[]) => {
                // Events can't be modified
                // The only modification is when firebase adds the timestamp.
                // So all modifications are actually treated as creations, as we ignore creations with empty timestamps
                callback(events.map((event: FirestoreDocument<PartEvent>) => event.data));
            },
            /* istanbul ignore next */
            () => {
                // Events can't be deleted,
            });
        return this.eventsCollection(partId).observingWhere([], internalCallback, 'time');
    }
}
