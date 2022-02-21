import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { Joiner } from '../domain/Joiner';
import { Injectable } from '@angular/core';
import { display } from 'src/app/utils/utils';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
export class JoinerDAO extends FirebaseFirestoreDAO<Joiner> {

    public static VERBOSE: boolean = true;

    constructor(firestore: Firestore) {
        super('joiners', firestore);
        display(JoinerDAO.VERBOSE, 'JoinerDAO.constructor');
    }
}
