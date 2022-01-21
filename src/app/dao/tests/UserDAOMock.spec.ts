/* eslint-disable max-lines-per-function */
import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { User, UserDocument } from 'src/app/domain/User';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { display } from 'src/app/utils/utils';
import { FirebaseFirestoreDAOMock } from './FirebaseFirestoreDAOMock.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';

type UserOS = ObservableSubject<MGPOptional<UserDocument>>

export class UserDAOMock extends FirebaseFirestoreDAOMock<User> {
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
    public observeUserByUsername(username: string, callback: FirebaseCollectionObserver<User>): () => void {
        return this.observingWhere([['username', '==', username], ['verified', '==', true]], callback);
    }
    public observeActiveUsers(callback: FirebaseCollectionObserver<User>): () => void {
        return this.observingWhere([['state', '==', 'online'], ['verified', '==', true]], callback);
    }
}
