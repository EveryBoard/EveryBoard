import { Injectable } from '@angular/core';
import { FirestoreDAO } from './FirestoreDAO';
import { User } from '../domain/User';
import { Debug } from '../utils/Debug';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class UserDAO extends FirestoreDAO<User> {

    public constructor() {
        super('users');
    }

}
