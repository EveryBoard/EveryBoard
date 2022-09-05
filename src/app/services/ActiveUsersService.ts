import { Injectable } from '@angular/core';
import { User, UserDocument } from '../domain/User';
import { UserDAO } from '../dao/UserDAO';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { display, Utils } from 'src/app/utils/utils';
import { Subscription } from 'rxjs';
import { Timestamp } from 'firebase/firestore';

@Injectable({
    providedIn: 'root',
})
export class ActiveUsersService {

    public static VERBOSE: boolean = false;

    private activeUsers: UserDocument[] = [];

    constructor(public userDAO: UserDAO) {
    }
    public subscribeToActiveUsers(callback: (users: UserDocument[]) => void): Subscription {
        display(ActiveUsersService.VERBOSE, 'ActiveUsersService.subscribeToActiveUsers');
        const onDocumentCreated: (newUsers: UserDocument[]) => void = (newUsers: UserDocument[]) => {
            display(ActiveUsersService.VERBOSE, 'our DAO gave us ' + newUsers.length + ' new user(s)');
            this.activeUsers = this.sort(this.activeUsers.concat(...newUsers));
            callback(this.activeUsers);
        };
        const onDocumentModified: (modifiedUsers: UserDocument[]) => void = (modifiedUsers: UserDocument[]) => {
            let updatedUsers: UserDocument[] = this.activeUsers;
            display(ActiveUsersService.VERBOSE, 'our DAO updated ' + modifiedUsers.length + ' user(s)');
            for (const u of modifiedUsers) {
                updatedUsers.forEach((user: UserDocument) => {
                    if (user.id === u.id) user.data = u.data;
                });
                updatedUsers = this.sort(updatedUsers);
            }
            this.activeUsers = updatedUsers;
            callback(this.activeUsers);
        };
        const onDocumentDeleted: (deletedUsers: UserDocument[]) => void = (deletedUsers: UserDocument[]) => {
            // No need to sort again upon deletion
            this.activeUsers =
                this.activeUsers.filter((u: UserDocument) =>
                    !deletedUsers.some((user: UserDocument) => user.id === u.id));
            callback(this.activeUsers);
        };
        const usersObserver: FirestoreCollectionObserver<User> =
            new FirestoreCollectionObserver(onDocumentCreated, onDocumentModified, onDocumentDeleted);
        return this.observeActiveUsers(usersObserver);
    }
    public observeActiveUsers(callback: FirestoreCollectionObserver<User>): Subscription {
        return this.userDAO.observingWhere([['state', '==', 'online'], ['verified', '==', true]], callback);
    }
    public sort(users: UserDocument[]): UserDocument[] {
        return users.sort((first: UserDocument, second: UserDocument) => {
            const firstData: Timestamp = Utils.getNonNullable(first.data).lastUpdateTime as Timestamp;
            const firstTimestamp: number = Utils.getNonNullable(firstData).seconds;
            const secondData: Timestamp = Utils.getNonNullable(second.data).lastUpdateTime as Timestamp;
            const secondTimestamp: number = Utils.getNonNullable(secondData).seconds;
            return firstTimestamp - secondTimestamp;
        });
    }
}
