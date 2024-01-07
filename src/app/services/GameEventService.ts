import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { FirestoreDocument, IFirestoreDAO } from '../dao/FirestoreDAO';
import { PartDAO } from '../dao/PartDAO';
import { GameEvent } from '../domain/Part';

@Injectable({
    providedIn: 'root',
})
export class GameEventService {

    public constructor(private readonly partDAO: PartDAO) {}

    private eventsCollection(partId: string): IFirestoreDAO<GameEvent> {
        return this.partDAO.subCollectionDAO<GameEvent>(partId, 'events');
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
