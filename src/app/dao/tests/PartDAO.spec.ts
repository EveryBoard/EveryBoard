import { TestBed } from '@angular/core/testing';
import { IPart, MGPResult } from 'src/app/domain/icurrentpart';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { PartDAO } from '../PartDAO';

describe('PartDAO', () => {

    let dao: PartDAO;

    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(PartDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
    describe('observeActivesParts', () => {
        it('should call observingWhere with the right condition', () => {
            const callback: FirebaseCollectionObserver<IPart> = new FirebaseCollectionObserver<IPart>(
                () => void { },
                () => void { },
                () => void { },
            );
            spyOn(dao, 'observingWhere');
            dao.observeActivesParts(callback);
            expect(dao.observingWhere).toHaveBeenCalledWith([['result', '==', MGPResult.UNACHIEVED.value]], callback);
        });
    });
});
