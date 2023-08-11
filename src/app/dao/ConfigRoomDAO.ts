import { FirestoreDAO } from './FirestoreDAO';
import { ConfigRoom } from '../domain/ConfigRoom';
import { Injectable } from '@angular/core';
import { Debug } from 'src/app/utils/utils';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ConfigRoomDAO extends FirestoreDAO<ConfigRoom> {

    public constructor(firestore: Firestore) {
        super('config-room', firestore);
    }
}
