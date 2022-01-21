import { FirebaseFirestoreDAO } from './FirebaseFirestoreDAO';
import { Joiner } from '../domain/Joiner';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { display } from 'src/app/utils/utils';

@Injectable({
    providedIn: 'root',
})
export class JoinerDAO extends FirebaseFirestoreDAO<Joiner> {
    public static VERBOSE: boolean = false;

    constructor(protected afs: AngularFirestore) {
        super('joiners', afs);
        display(JoinerDAO.VERBOSE, 'JoinerDAO.constructor');
    }
}
