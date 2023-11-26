import { Injectable } from '@angular/core';
import { User, UserDocument } from '../domain/User';
import { UserDAO } from '../dao/UserDAO';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { Debug, Utils } from 'src/app/utils/utils';
import { Subscription } from 'rxjs';
import { Timestamp } from 'firebase/firestore';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ActiveUsersService {

    public constructor(public userDAO: UserDAO) {
    }
    public subscribeToActiveUsers(callback: (users: UserDocument[]) => void): Subscription {
        let activeUsers: UserDocument[] = [];
        const onDocumentCreated: (newUsers: UserDocument[]) => void = (newUsers: UserDocument[]) => {
            activeUsers = this.sort(activeUsers.concat(...newUsers));
            callback(activeUsers);
        };
        const onDocumentModified: (modifiedUsers: UserDocument[]) => void = (modifiedUsers: UserDocument[]) => {
            let updatedUsers: UserDocument[] = activeUsers;
            for (const u of modifiedUsers) {
                updatedUsers.forEach((user: UserDocument) => {
                    if (user.id === u.id) user.data = u.data;
                });
                updatedUsers = this.sort(updatedUsers);
            }
            activeUsers = updatedUsers;
            callback(activeUsers);
        };
        const onDocumentDeleted: (deletedUsers: UserDocument[]) => void = (deletedUsers: UserDocument[]) => {
            // No need to sort again upon deletion
            activeUsers = activeUsers.filter((u: UserDocument) =>
                deletedUsers.some((user: UserDocument) => user.id === u.id) === false);
            callback(activeUsers);
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
