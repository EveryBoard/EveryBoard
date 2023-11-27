import { Injectable } from '@angular/core';
import { FirestoreDAO } from './FirestoreDAO';
import { User } from '../domain/User';
import { Firestore } from '@angular/fire/firestore';
import { Debug } from '../utils/Debug';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class UserDAO extends FirestoreDAO<User> {

    public static COLLECTION_NAME: string = 'users';

    public constructor(firestore: Firestore) {
        super(UserDAO.COLLECTION_NAME, firestore);
    }
}
