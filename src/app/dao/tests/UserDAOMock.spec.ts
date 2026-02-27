import { MGPMap, MGPOptional, ObservableSubject } from '@everyboard/lib';

import { User, UserDocument } from '../../domain/User';
import { Debug } from '../../utils/Debug';

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
