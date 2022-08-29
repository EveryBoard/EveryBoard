import { FirestoreDAO } from './FirestoreDAO';
import { ConfigRoom } from '../domain/ConfigRoom';
import { Injectable } from '@angular/core';
import { display } from 'src/app/utils/utils';
import { Firestore } from '@angular/fire/firestore';
import { MinimalUser } from '../domain/MinimalUser';

@Injectable({
    providedIn: 'root',
})
export class ConfigRoomDAO extends FirestoreDAO<ConfigRoom> {

    public static VERBOSE: boolean = false;

    constructor(firestore: Firestore) {
        super('config-room', firestore);
        display(ConfigRoomDAO.VERBOSE, 'ConfigRoomDAO.constructor');
    }
    public addCandidate(partId: string, candidate: MinimalUser): Promise<void> {
        return this.subCollectionDAO(partId, 'candidates').set(candidate.id, candidate);
    }
    public removeCandidate(partId: string, candidate: MinimalUser): Promise<void> {
        return this.subCollectionDAO(partId, 'candidates').delete(candidate.id);
    }
}
