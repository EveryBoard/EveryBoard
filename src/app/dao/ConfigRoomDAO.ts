import { FirestoreDAO } from './FirestoreDAO';
import { ConfigRoom } from '../domain/ConfigRoom';
import { Injectable } from '@angular/core';
import { Debug } from '../utils/Debug';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ConfigRoomDAO extends FirestoreDAO<ConfigRoom> {

    public constructor() {
        super('config-room');
    }
}
