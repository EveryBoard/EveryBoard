import { Injectable } from '@angular/core';

import { ConfigRoom } from '../domain/ConfigRoom';
import { Debug } from '../utils/Debug';
import { FirestoreDAO } from './FirestoreDAO';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ConfigRoomDAO extends FirestoreDAO<ConfigRoom> {

    public constructor() {
        super('config-room');
    }
}
