/* eslint-disable max-lines-per-function */
import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { User, UserDocument } from 'src/app/domain/User';
import { FirestoreCollectionObserver } from '../FirestoreCollectionObserver';
import { display } from 'src/app/utils/utils';
import { FirestoreDAOMock } from './FirestoreDAOMock.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';

type UserOS = ObservableSubject<MGPOptional<UserDocument>>

export class UserDAOMock extends FirestoreDAOMock<User> {
    public static VERBOSE: boolean = false;

    private static joueursDB: MGPMap<string, UserOS>;

    public constructor() {
        super('UserDAOMock', UserDAOMock.VERBOSE);
        display(this.VERBOSE, 'UserDAOMock.constructor');
    }
    public getStaticDB(): MGPMap<string, UserOS> {
        return UserDAOMock.joueursDB;
    }
    public resetStaticDB(): void {
        UserDAOMock.joueursDB = new MGPMap();
    }
    public observeUserByUsername(username: string, callback: FirestoreCollectionObserver<User>): () => void {
        return this.observingWhere([['username', '==', username], ['verified', '==', true]], callback);
    }
    public observeActiveUsers(callback: FirestoreCollectionObserver<User>): () => void {
        return this.observingWhere([['state', '==', 'online'], ['verified', '==', true]], callback);
    }
}
