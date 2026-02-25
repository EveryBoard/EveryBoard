import { Injectable } from '@angular/core';

import { Part } from '../domain/Part';
import { Debug } from '../utils/Debug';

import { FirestoreDAO } from './FirestoreDAO';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class PartDAO extends FirestoreDAO<Part> {

    public constructor() {
        super('parts');
    }
}
