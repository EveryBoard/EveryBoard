import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUser, IUserId } from '../domain/iuser';
import { UserDAO } from '../dao/UserDAO';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';
import { display, Utils } from 'src/app/utils/utils';

@Injectable({
    providedIn: 'root',
})
export class ActiveUsersService {
    public static VERBOSE: boolean = false;

    private readonly activesUsersBS: BehaviorSubject<IUserId[]> = new BehaviorSubject<IUserId[]>([]);

    public activesUsersObs: Observable<IUserId[]>;

    private unsubscribe: () => void;

    constructor(public userDAO: UserDAO) {
        this.activesUsersObs = this.activesUsersBS.asObservable();
    }
    public startObserving(): void {
        display(ActiveUsersService.VERBOSE, 'ActiveUsersService.startObservingActiveUsers');
        const onDocumentCreated: (newUsers: IUserId[]) => void = (newUsers: IUserId[]) => {
            display(ActiveUsersService.VERBOSE, 'our DAO gave us ' + newUsers.length + ' new user(s)');
            const newUsersList: IUserId[] = this.activesUsersBS.value.concat(...newUsers);
            this.activesUsersBS.next(this.order(newUsersList));
        };
        const onDocumentModified: (modifiedUsers: IUserId[]) => void = (modifiedUsers: IUserId[]) => {
            let updatedUsers: IUserId[] = this.activesUsersBS.value;
            display(ActiveUsersService.VERBOSE, 'our DAO updated ' + modifiedUsers.length + ' user(s)');
            for (const u of modifiedUsers) {
                updatedUsers.forEach((user: IUserId) => {
                    if (user.id === u.id) user.doc = u.doc;
                });
                updatedUsers = this.order(updatedUsers);
            }
            this.activesUsersBS.next(updatedUsers);
        };
        const onDocumentDeleted: (deletedUsers: IUserId[]) => void = (deletedUsers: IUserId[]) => {
            const newUsersList: IUserId[] =
                this.activesUsersBS.value.filter((u: IUserId) =>
                    !deletedUsers.some((user: IUserId) => user.id === u.id));
            this.activesUsersBS.next(this.order(newUsersList));
        };
        const usersObserver: FirebaseCollectionObserver<IUser> =
            new FirebaseCollectionObserver(onDocumentCreated,
                                           onDocumentModified,
                                           onDocumentDeleted);
        this.unsubscribe = this.userDAO.observeActiveUsers(usersObserver);
    }
    public stopObserving(): void {
        this.unsubscribe();
        this.activesUsersBS.next([]);
    }
    public order(users: IUserId[]): IUserId[] {
        return users.sort((first: IUserId, second: IUserId) => {
            const firstTimestamp: number = Utils.getNonNullable(Utils.getNonNullable(first.doc).last_changed).seconds;
            const secondTimestamp: number = Utils.getNonNullable(Utils.getNonNullable(second.doc).last_changed).seconds;
            return firstTimestamp - secondTimestamp;
        });
    }
}
