import { Injectable } from '@angular/core';

import { User } from '../domain/User';
import { Debug } from '../utils/Debug';
import { FirestoreDAO } from './FirestoreDAO';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class UserDAO extends FirestoreDAO<User> {

    public constructor() {
        super('users');
    }

}
