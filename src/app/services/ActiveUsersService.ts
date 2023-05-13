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

    public constructor(public userDAO: UserDAO) {
    }
    public subscribeToActiveUsers(callback: (users: UserDocument[]) => Promise<void>): Subscription {
        display(ActiveUsersService.VERBOSE, 'ActiveUsersService.subscribeToActiveUsers');
        let activeUsers: UserDocument[] = [];
        const onDocumentCreated: (newUsers: UserDocument[]) => Promise<void> = async(newUsers: UserDocument[]) => {
            display(ActiveUsersService.VERBOSE, 'our DAO gave us ' + newUsers.length + ' new user(s)');
            activeUsers = this.sort(activeUsers.concat(...newUsers));
            return callback(activeUsers);
        };
        const onDocumentModified: (modifiedUsers: UserDocument[]) => Promise<void> = async(modifiedUsers: UserDocument[]) => {
            let updatedUsers: UserDocument[] = activeUsers;
            display(ActiveUsersService.VERBOSE, 'our DAO updated ' + modifiedUsers.length + ' user(s)');
            for (const u of modifiedUsers) {
                updatedUsers.forEach((user: UserDocument) => {
                    if (user.id === u.id) user.data = u.data;
                });
                updatedUsers = this.sort(updatedUsers);
            }
            activeUsers = updatedUsers;
            return callback(activeUsers);
        };
        const onDocumentDeleted: (deletedUsers: UserDocument[]) => Promise<void> = async(deletedUsers: UserDocument[]) => {
            // No need to sort again upon deletion
            activeUsers =
                activeUsers.filter((u: UserDocument) =>
                    !deletedUsers.some((user: UserDocument) => user.id === u.id));
            return callback(activeUsers);
        };
        const usersObserver: FirestoreCollectionObserver<User> =
            new FirestoreCollectionObserver(onDocumentCreated, onDocumentModified, onDocumentDeleted);
        return this.userDAO.observingWhere([['state', '==', 'online'], ['verified', '==', true]], usersObserver);
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
