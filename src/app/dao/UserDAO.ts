import { Injectable } from '@angular/core';
import { FirestoreDAO } from './FirestoreDAO';
import { display } from 'src/app/utils/utils';
import { User } from '../domain/User';
import { Firestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { MGPOptional } from '../utils/MGPOptional';

@Injectable({
    providedIn: 'root',
})
export class UserDAO extends FirestoreDAO<User> {

    public static override VERBOSE: boolean = false;

    public static COLLECTION_NAME: string = 'users';

    public constructor(firestore: Firestore) {
        super(UserDAO.COLLECTION_NAME, firestore);
        display(UserDAO.VERBOSE, 'UserDAO.constructor');
    }
}
