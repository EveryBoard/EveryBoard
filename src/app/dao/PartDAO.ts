import { Injectable } from '@angular/core';

import { FirestoreDAO } from './FirestoreDAO';
import { Part } from '../domain/Part';
import { Debug } from '../utils/Debug';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class PartDAO extends FirestoreDAO<Part> {

    public constructor() {
        super('parts');
    }
}
