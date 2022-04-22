import { FirestoreDAO } from './FirestoreDAO';
import { Joiner } from '../domain/Joiner';
import { Injectable } from '@angular/core';
import { display } from 'src/app/utils/utils';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
export class JoinerDAO extends FirestoreDAO<Joiner> {
    public static VERBOSE: boolean = false;

    constructor(firestore: Firestore) {
        super('joiners', firestore);
        display(JoinerDAO.VERBOSE, 'JoinerDAO.constructor');
    }
}
