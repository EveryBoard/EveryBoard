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

    public static COLLECTION_NAME: string = 'users';

    constructor(firestore: Firestore) {
        super(this.COLLECTION_NAME, firestore);
        display(UserDAO.VERBOSE, 'UserDAO.constructor');
    }
}
