import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {IJoueurId, IJoueur} from '../../domain/iuser';
import {JoueursDAO} from '../../dao/JoueursDAO';
import { FirebaseCollectionObserver } from '../../dao/FirebaseCollectionObserver';

@Injectable({
    providedIn: 'root'
})
export class ActivesUsersService {

    public static VERBOSE: boolean = false;

    private activesUsersBS = new BehaviorSubject<IJoueurId[]>([]);

    public activesUsersObs = this.activesUsersBS.asObservable();

    private unsubscribe: () => void;

    constructor(private joueursDAO: JoueursDAO) {
    }
    public startObserving() {
        if (ActivesUsersService.VERBOSE) console.log("ActivesUsersService.startObservingActivesUsers");
        const joueursObserver: FirebaseCollectionObserver<IJoueur> = new FirebaseCollectionObserver();
        joueursObserver.onDocumentModified = (users) => {
            let updatedUsers: IJoueurId[] = this.activesUsersBS.value;
            if (ActivesUsersService.VERBOSE) console.log("our DAO updated " + users.length + " user(s)");
            for (let u of users) {
                updatedUsers.forEach(user => {
                    if (user.id === u.id) user.doc = u.doc;
                });
                updatedUsers = this.order(updatedUsers);
            }
            this.activesUsersBS.next(updatedUsers);
        };
        joueursObserver.onDocumentCreated = (newUsers) => {
            if (ActivesUsersService.VERBOSE) console.log("our DAO gave us " + newUsers.length + " new user(s)");
            const newUsersList: IJoueurId[] = this.activesUsersBS.value.concat(...newUsers);
            this.activesUsersBS.next(this.order(newUsersList));
        };
        joueursObserver.onDocumentDeleted = (deletedUsers) => {
            const deletedUsersId: string[] = deletedUsers.map(u => u.id);
            const newUsersList: IJoueurId[] = this.activesUsersBS.value.filter(u => !deletedUsersId.includes(u.id));
            this.activesUsersBS.next(this.order(newUsersList));
        };
        this.unsubscribe = this.joueursDAO.observeActivesUsers(joueursObserver);
    }
    public stopObserving() {
        this.unsubscribe();
        this.activesUsersBS.next([]);
    }
    public order(users: IJoueurId[]): IJoueurId[] {
        return users.sort((first, second) => {
            const firstTimestamp: number = (first.doc.last_changed as {seconds: number}).seconds;
            const secondTimestamp: number = (second.doc.last_changed as {seconds: number}).seconds;
            return firstTimestamp - secondTimestamp;
        });
    }
}