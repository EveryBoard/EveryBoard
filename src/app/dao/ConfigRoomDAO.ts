import { FirestoreDAO } from './FirestoreDAO';
import { ConfigRoom } from '../domain/ConfigRoom';
import { Injectable } from '@angular/core';
import { display } from 'src/app/utils/utils';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
export class ConfigRoomDAO extends FirestoreDAO<ConfigRoom> {

    public static override VERBOSE: boolean = false;

    public constructor(firestore: Firestore) {
        super('config-room', firestore);
        display(ConfigRoomDAO.VERBOSE, 'ConfigRoomDAO.constructor');
    }
}
