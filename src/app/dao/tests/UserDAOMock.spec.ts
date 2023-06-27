import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { User, UserDocument } from 'src/app/domain/User';
import { Debug } from 'src/app/utils/utils';
import { FirestoreDAOMock } from './FirestoreDAOMock.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';

type UserOS = ObservableSubject<MGPOptional<UserDocument>>

@Debug.log
export class UserDAOMock extends FirestoreDAOMock<User> {

    public static override VERBOSE: boolean = false;

    private static usersDB: MGPMap<string, UserOS>;

    public constructor() {
        super('UserDAOMock', UserDAOMock.VERBOSE);
    }
    public getStaticDB(): MGPMap<string, UserOS> {
        return UserDAOMock.usersDB;
    }
    public resetStaticDB(): void {
        UserDAOMock.usersDB = new MGPMap();
    }
}
