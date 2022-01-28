import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserDocument } from '../domain/User';
import { UserDAO } from '../dao/UserDAO';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';
import { display, Utils } from 'src/app/utils/utils';

@Injectable({
    providedIn: 'root',
})
export class ActiveUsersService {
    public static VERBOSE: boolean = false;

    private readonly activeUsersBS: BehaviorSubject<UserDocument[]> = new BehaviorSubject<UserDocument[]>([]);

    public activeUsersObs: Observable<UserDocument[]>;

    private unsubscribe: () => void;

    constructor(public userDAO: UserDAO) {
        this.activeUsersObs = this.activeUsersBS.asObservable();
    }
    public startObserving(): void {
        display(ActiveUsersService.VERBOSE, 'ActiveUsersService.startObservingActiveUsers');
        const onDocumentCreated: (newUsers: UserDocument[]) => void = (newUsers: UserDocument[]) => {
            display(ActiveUsersService.VERBOSE, 'our DAO gave us ' + newUsers.length + ' new user(s)');
            const newUsersList: UserDocument[] = this.activeUsersBS.value.concat(...newUsers);
            this.activeUsersBS.next(this.sort(newUsersList));
        };
        const onDocumentModified: (modifiedUsers: UserDocument[]) => void = (modifiedUsers: UserDocument[]) => {
            let updatedUsers: UserDocument[] = this.activeUsersBS.value;
            display(ActiveUsersService.VERBOSE, 'our DAO updated ' + modifiedUsers.length + ' user(s)');
            for (const u of modifiedUsers) {
                updatedUsers.forEach((user: UserDocument) => {
                    if (user.id === u.id) user.data = u.data;
                });
                updatedUsers = this.sort(updatedUsers);
            }
            this.activeUsersBS.next(updatedUsers);
        };
        const onDocumentDeleted: (deletedUsers: UserDocument[]) => void = (deletedUsers: UserDocument[]) => {
            const newUsersList: UserDocument[] =
                this.activeUsersBS.value.filter((u: UserDocument) =>
                    !deletedUsers.some((user: UserDocument) => user.id === u.id));
            this.activeUsersBS.next(this.sort(newUsersList));
        };
        const usersObserver: FirebaseCollectionObserver<User> =
            new FirebaseCollectionObserver(onDocumentCreated,
                                           onDocumentModified,
                                           onDocumentDeleted);
        this.unsubscribe = this.userDAO.observeActiveUsers(usersObserver);
    }
    public stopObserving(): void {
        this.unsubscribe();
        this.activeUsersBS.next([]);
    }
    public sort(users: UserDocument[]): UserDocument[] {
        return users.sort((first: UserDocument, second: UserDocument) => {
            const firstTimestamp: number =
                Utils.getNonNullable(Utils.getNonNullable(first.data).last_changed).seconds;
            const secondTimestamp: number =
                Utils.getNonNullable(Utils.getNonNullable(second.data).last_changed).seconds;
            return firstTimestamp - secondTimestamp;
        });
    }
}
