import { Injectable } from '@angular/core';
import { serverTimestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { FirestoreDocument, IFirestoreDAO } from '../dao/FirestoreDAO';
import { PartDAO } from '../dao/PartDAO';
import { Action, GameEvent, Reply, RequestType } from '../domain/Part';
import { Player } from '../jscaip/Player';
import { JSONValue } from '../utils/utils';

@Injectable({
    providedIn: 'root',
})
export class GameEventService {

    public constructor(private readonly partDAO: PartDAO) {}

    private eventsCollection(partId: string): IFirestoreDAO<GameEvent> {
        return this.partDAO.subCollectionDAO<GameEvent>(partId, 'events');
    }
    private addEvent(partId: string, event: GameEvent): Promise<string> {
        return this.eventsCollection(partId).create(event);
    }
    public addMove(partId: string, player: Player, move: JSONValue): Promise<string> {
        return this.addEvent(partId, {
            eventType: 'Move',
            time: serverTimestamp(),
            player: player.getValue() as 0|1,
            move,
        });
    }
    public addRequest(partId: string, player: Player, requestType: RequestType): Promise<string> {
        return this.addEvent(partId, {
            eventType: 'Request',
            time: serverTimestamp(),
            player: player.getValue() as 0|1,
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
            player: player.getValue() as 0|1,
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
            player: player.getValue() as 0|1,
            action,
        });
    }
    public subscribeToEvents(partId: string, callback: (events: GameEvent[]) => void): Subscription {
        const internalCallback: FirestoreCollectionObserver<GameEvent> = new FirestoreCollectionObserver(
            (events: FirestoreDocument<GameEvent>[]) => {
                // When the client adds an event, firebase will initially have a null timestamp for the document creator
                // When the event is really written, all the clients receive a modification with the real timestamp
                // We want to keep only the latter.
                const realEvents: GameEvent[] = events
                    .map((event: FirestoreDocument<GameEvent>) => event.data)
                    .filter((event: GameEvent) => event.time != null);
                if (realEvents.length > 0) {
                    callback(realEvents);
                }
            },
            (events: FirestoreDocument<GameEvent>[]) => {
                // Events can't be modified
                // The only modification is when firebase adds the timestamp.
                // So all modifications are actually treated as creations, as we ignore creations with empty timestamps
                callback(events.map((event: FirestoreDocument<GameEvent>) => event.data));
            },
            /* istanbul ignore next */
            () => {
                // Events can't be deleted,
            });
        return this.eventsCollection(partId).observingWhere([], internalCallback, 'time');
    }
}
