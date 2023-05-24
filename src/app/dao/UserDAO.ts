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

    public override subscribeToChanges(userId: string, callback: (user: MGPOptional<User>) => void): Subscription {
        return super.subscribeToChanges(userId, (user: MGPOptional<User>): void => {
            if (user.isPresent() && user.get().lastUpdateTime === null) {
                // Ignore this update as it does not come from firebase but from ourselves
                // We will get the firebase update later.
                return;
            }
            callback(user);
        });
    }
}
