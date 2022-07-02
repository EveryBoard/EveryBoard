import { Injectable } from '@angular/core';
import { FirestoreDAO } from './FirestoreDAO';
import { display } from 'src/app/utils/utils';
import { User } from '../domain/User';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
export class UserDAO extends FirestoreDAO<User> {

    public static VERBOSE: boolean = false;

    constructor(firestore: Firestore) {
        super('joueurs', firestore);
        display(UserDAO.VERBOSE, 'UserDAO.constructor');
    }
}
