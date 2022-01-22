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

    private readonly activesUsersBS: BehaviorSubject<UserDocument[]> = new BehaviorSubject<UserDocument[]>([]);

    public activesUsersObs: Observable<UserDocument[]>;

    private unsubscribe: () => void;

    constructor(public userDAO: UserDAO) {
        this.activesUsersObs = this.activesUsersBS.asObservable();
    }
    public startObserving(): void {
        display(ActiveUsersService.VERBOSE, 'ActiveUsersService.startObservingActiveUsers');
        const onDocumentCreated: (newUsers: UserDocument[]) => void = (newUsers: UserDocument[]) => {
            display(ActiveUsersService.VERBOSE, 'our DAO gave us ' + newUsers.length + ' new user(s)');
            const newUsersList: UserDocument[] = this.activesUsersBS.value.concat(...newUsers);
            this.activesUsersBS.next(this.sort(newUsersList));
        };
        const onDocumentModified: (modifiedUsers: UserDocument[]) => void = (modifiedUsers: UserDocument[]) => {
            let updatedUsers: UserDocument[] = this.activesUsersBS.value;
            display(ActiveUsersService.VERBOSE, 'our DAO updated ' + modifiedUsers.length + ' user(s)');
            for (const u of modifiedUsers) {
                updatedUsers.forEach((user: UserDocument) => {
                    if (user.id === u.id) user.data = u.data;
                });
                updatedUsers = this.sort(updatedUsers);
            }
            this.activesUsersBS.next(updatedUsers);
        };
        const onDocumentDeleted: (deletedUsers: UserDocument[]) => void = (deletedUsers: UserDocument[]) => {
            const newUsersList: UserDocument[] =
                this.activesUsersBS.value.filter((u: UserDocument) =>
                    !deletedUsers.some((user: UserDocument) => user.id === u.id));
            this.activesUsersBS.next(this.sort(newUsersList));
        };
        const usersObserver: FirebaseCollectionObserver<User> =
            new FirebaseCollectionObserver(onDocumentCreated,
                                           onDocumentModified,
                                           onDocumentDeleted);
        this.unsubscribe = this.userDAO.observeActiveUsers(usersObserver);
    }
    public stopObserving(): void {
        this.unsubscribe();
        this.activesUsersBS.next([]);
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
