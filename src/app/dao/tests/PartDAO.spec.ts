/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { IPart, MGPResult } from 'src/app/domain/icurrentpart';
import { Player } from 'src/app/jscaip/Player';
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
    describe('updateAndBumpIndex', () => {
        it('Should delegate to update and bump index', () => {
            // Given a PartDAO and an update to make to the part
            spyOn(dao, 'update').and.resolveTo();
            const update: Partial<IPart> = {
                turn: 42,
            };

            // When calling updateAndBumpIndex
            dao.updateAndBumpIndex('partId', Player.ZERO, 73, update);

            // Then update should have been called with lastUpdate infos added to it
            const expectedUpdate: Partial<IPart> = {
                lastUpdate: {
                    index: 74,
                    player: Player.ZERO.value,
                },
                turn: 42,
            };
            expect(dao.update).toHaveBeenCalledOnceWith('partId', expectedUpdate);
        });
    });
});
