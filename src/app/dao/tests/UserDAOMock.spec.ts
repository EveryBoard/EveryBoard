import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { IUserId, IUser } from 'src/app/domain/iuser';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { display } from 'src/app/utils/utils';
import { FirebaseFirestoreDAOMock } from './FirebaseFirestoreDAOMock.spec';

type UserOS = ObservableSubject<IUserId>

export class UserDAOMock extends FirebaseFirestoreDAOMock<IUser> {
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
    public observeUserByUsername(username: string, callback: FirebaseCollectionObserver<IUser>): () => void {
        return this.observingWhere([['username', '==', username], ['verified', '==', true]], callback);
    }
    public observeActivesUsers(callback: FirebaseCollectionObserver<IUser>): () => void {
        return this.observingWhere([['state', '==', 'online'], ['verified', '==', true]], callback);
    }
}
