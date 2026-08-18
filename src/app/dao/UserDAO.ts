import { Injectable } from '@angular/core';

import { Debug } from '@everyboard/games';

import { User } from '../domain/User';

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
