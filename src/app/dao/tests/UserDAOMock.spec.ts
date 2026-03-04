import { User, UserDocument } from 'src/app/domain/User';
import { Debug } from 'src/app/utils/Debug';
import { ObservableSubject } from 'src/app/utils/ObservableSubject';

import { MGPMap, MGPOptional } from '@everyboard/lib';

import { FirestoreDAOMock } from './FirestoreDAOMock.spec';

type UserOS = ObservableSubject<MGPOptional<UserDocument>>;

@Debug.log
export class UserDAOMock extends FirestoreDAOMock<User> {

    private static usersDB: MGPMap<string, UserOS>;

    public constructor() {
        super('UserDAOMock');
    }
    public getStaticDB(): MGPMap<string, UserOS> {
        return UserDAOMock.usersDB;
    }
    public resetStaticDB(): void {
        UserDAOMock.usersDB = new MGPMap();
    }
}
