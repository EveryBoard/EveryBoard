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

    public constructor(private readonly partDAO: PartDAO) {
    }

    private eventsCollection(partId: string): IFirestoreDAO<GameEvent> {
        return this.partDAO.subCollectionDAO<GameEvent>(partId, 'events');
    }

    public subscribeToEvents(partId: string, callback: (events: GameEvent[]) => void): Subscription {
        const internalCallback: FirestoreCollectionObserver<GameEvent> = new FirestoreCollectionObserver(
            (events: FirestoreDocument<GameEvent>[]) => {
                // Events can only be created.
                // The timestamp is filled by the backend, and we have it directly at creation.
                callback(events.map((event: FirestoreDocument<GameEvent>) => event.data));
            },
            /* istanbul ignore next */
            (_events: FirestoreDocument<GameEvent>[]) => {
                // Events can't be modified
            },
            /* istanbul ignore next */
            () => {
                // Events can't be deleted,
            });
        return this.eventsCollection(partId).observingWhere([], internalCallback, 'time');
    }

}
