import { TestBed } from '@angular/core/testing';
import { IUser } from 'src/app/domain/iuser';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { UserDAO } from '../UserDAO';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { createConnectedGoogleUser } from 'src/app/services/tests/AuthenticationService.spec';
import { Utils } from 'src/app/utils/utils';

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
        xit('should change the username of a user', async() => {
            // Test disabled due to being flaky, resulting in "invalid API key" errors randomly
            // given a google user
            const uid: string = Utils.getNonNullable((await createConnectedGoogleUser(true)).user).uid;

            // when its username is set
            await dao.setUsername(uid, 'foo');

            // then its username has changed
            const user: IUser = (await dao.read(uid)).get();
            expect(user.username).toEqual('foo');
        });
    });
});
