import { serverTimestamp } from 'firebase/firestore';
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

    private static usersDB: MGPMap<string, UserOS>;

    public constructor() {
        super('UserDAOMock', UserDAOMock.VERBOSE);
        display(this.VERBOSE, 'UserDAOMock.constructor');
    }
    public getStaticDB(): MGPMap<string, UserOS> {
        return UserDAOMock.usersDB;
    }
    public resetStaticDB(): void {
        UserDAOMock.usersDB = new MGPMap();
    }
    public observeUser(id: string, callback: FirestoreCollectionObserver<User>): () => void {
        return this.observingWhere([['id', '==', id]], callback);
    }
    public observeUserByUsername(username: string, callback: FirestoreCollectionObserver<User>): () => void {
        return this.observingWhere([['username', '==', username]], callback);
    }
    public observeActiveUsers(callback: FirestoreCollectionObserver<User>): () => void {
        return this.observingWhere([['state', '==', 'online'], ['verified', '==', true]], callback);
    }
    public updatePresenceToken(userId: string): Promise<void> {
        return this.update(userId, {
            last_changed: serverTimestamp(),
        });
    }
}
