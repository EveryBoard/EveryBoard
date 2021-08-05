import { TestBed } from '@angular/core/testing';
import { IJoueur } from 'src/app/domain/iuser';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { JoueursDAO } from '../JoueursDAO';
import { setupFirestoreTestModule } from './FirebaseFirestoreDAO.spec';

describe('JoueursDAO', () => {
    let dao: JoueursDAO;
    beforeEach(async() => {
        await setupFirestoreTestModule();
        dao = TestBed.inject(JoueursDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
    describe('observeUserByPseudo', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirebaseCollectionObserver<IJoueur> = new FirebaseCollectionObserver<IJoueur>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(dao, 'observingWhere');
            dao.observeUserByPseudo('jeanjaja', callback);
            expect(dao.observingWhere).toHaveBeenCalledWith('pseudo', '==', 'jeanjaja', callback);
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
