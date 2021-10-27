import { TestBed } from '@angular/core/testing';
import { IUser } from 'src/app/domain/iuser';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { UserDAO } from '../UserDAO';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import firebase from 'firebase/app';
import 'firebase/auth';

describe('UserDAO', () => {

    let dao: UserDAO;

    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(UserDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
    describe('observeUserByUsername', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirebaseCollectionObserver<IUser> = new FirebaseCollectionObserver<IUser>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(dao, 'observingWhere');
            dao.observeUserByUsername('jeanjaja', callback);
            expect(dao.observingWhere).toHaveBeenCalledWith([
                ['username', '==', 'jeanjaja'],
                ['verified', '==', true],
            ],
                                                            callback);
        });
    });
    describe('observeActivesUsers', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirebaseCollectionObserver<IUser> = new FirebaseCollectionObserver<IUser>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(dao, 'observingWhere');
            dao.observeActivesUsers(callback);
            expect(dao.observingWhere).toHaveBeenCalledWith([
                ['state', '==', 'online'],
                ['verified', '==', true],
            ],
                                                            callback);
        });
    });
    describe('setUsername', () => {
        it('should change the username of a user', async() => {
            // given a user
            const credentials: firebase.auth.UserCredential = await firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential('{"sub": "abc123", "email": "bar@example.com", "email_verified": true}'));
            const uid: string = credentials.user.uid;
            await dao.set(uid, { username: null, verified: true });

            // when its username is set
            await dao.setUsername(uid, 'foo');

            // then its username has changed
            const user: IUser = await dao.read(uid);
            expect(user.username).toEqual('foo');
        });
    });
});
