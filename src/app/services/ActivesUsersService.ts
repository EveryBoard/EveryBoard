import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUserId, IUser } from '../domain/iuser';
import { UserDAO } from '../dao/UserDAO';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';
import { display } from 'src/app/utils/utils';

@Injectable({
    providedIn: 'root',
})
export class ActivesUsersService {
    public static VERBOSE: boolean = false;

    private activesUsersBS: BehaviorSubject<IUserId[]> = new BehaviorSubject<IUserId[]>([]);

    public activesUsersObs: Observable<IUserId[]>;

    private unsubscribe: () => void;

    constructor(public userDAO: UserDAO) {
        this.activesUsersObs = this.activesUsersBS.asObservable();
    }
    public startObserving(): void {
        display(ActivesUsersService.VERBOSE, 'ActivesUsersService.startObservingActivesUsers');
        const onDocumentCreated: (newUsers: IUserId[]) => void = (newUsers: IUserId[]) => {
            display(ActivesUsersService.VERBOSE, 'our DAO gave us ' + newUsers.length + ' new user(s)');
            const newUsersList: IUserId[] = this.activesUsersBS.value.concat(...newUsers);
            this.activesUsersBS.next(this.order(newUsersList));
        };
        const onDocumentModified: (modifiedUsers: IUserId[]) => void = (modifiedUsers: IUserId[]) => {
            let updatedUsers: IUserId[] = this.activesUsersBS.value;
            display(ActivesUsersService.VERBOSE, 'our DAO updated ' + modifiedUsers.length + ' user(s)');
            for (const u of modifiedUsers) {
                updatedUsers.forEach((user: IUserId) => {
                    if (user.id === u.id) user.doc = u.doc;
                });
                updatedUsers = this.order(updatedUsers);
            }
            this.activesUsersBS.next(updatedUsers);
        };
        const onDocumentDeleted: (deletedUsers: IUserId[]) => void = (deletedUsers: IUserId[]) => {
            const deletedUsersId: string[] = deletedUsers.map((u: IUserId) => u.id);
            const newUsersList: IUserId[] =
                this.activesUsersBS.value.filter((u: IUserId) => !deletedUsersId.includes(u.id));
            this.activesUsersBS.next(this.order(newUsersList));
        };
        const usersObserver: FirebaseCollectionObserver<IUser> =
            new FirebaseCollectionObserver(onDocumentCreated,
                                           onDocumentModified,
                                           onDocumentDeleted);
        this.unsubscribe = this.userDAO.observeActivesUsers(usersObserver);
    }
    public stopObserving(): void {
        this.unsubscribe();
        this.activesUsersBS.next([]);
    }
    public order(users: IUserId[]): IUserId[] {
        return users.sort((first: IUserId, second: IUserId) => {
            const firstTimestamp: number = (first.doc.last_changed as {seconds: number}).seconds;
            const secondTimestamp: number = (second.doc.last_changed as {seconds: number}).seconds;
            return firstTimestamp - secondTimestamp;
        });
    }
}
