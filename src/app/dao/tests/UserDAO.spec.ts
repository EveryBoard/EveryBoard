import { TestBed } from '@angular/core/testing';
import { IJoueur } from 'src/app/domain/iuser';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { UserDAO } from '../UserDAO';
import { setupFirestoreTestModule } from './FirebaseFirestoreDAO.spec';

describe('UserDAO', () => {

    let dao: UserDAO;

    beforeEach(async() => {
        await setupFirestoreTestModule();
        dao = TestBed.inject(UserDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
    describe('observeUserByUsername', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirebaseCollectionObserver<IJoueur> = new FirebaseCollectionObserver<IJoueur>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(dao, 'observingWhere');
            dao.observeUserByUsername('jeanjaja', callback);
            expect(dao.observingWhere).toHaveBeenCalledWith('username', '==', 'jeanjaja', callback);
        });
    });
    describe('observeActivesUsers', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirebaseCollectionObserver<IJoueur> = new FirebaseCollectionObserver<IJoueur>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(dao, 'observingWhere');
            dao.observeActivesUsers(callback);
            expect(dao.observingWhere).toHaveBeenCalledWith('state', '==', 'online', callback);
        });
    });
});
