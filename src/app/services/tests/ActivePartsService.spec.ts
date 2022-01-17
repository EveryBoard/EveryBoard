/* eslint-disable max-lines-per-function */
import { ActivePartsService } from '../ActivePartsService';
import { PartDAO } from 'src/app/dao/PartDAO';
import { fakeAsync, tick } from '@angular/core/testing';
import { IPart, IPartId } from 'src/app/domain/icurrentpart';
import { Subscription } from 'rxjs';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { Utils } from 'src/app/utils/utils';

describe('ActivePartsService', () => {

    let service: ActivePartsService;

    let partDAO: PartDAO;

    let stoppedObserving: boolean;

    beforeEach(async() => {
        partDAO = new PartDAOMock() as unknown as PartDAO;
        service = new ActivePartsService(partDAO);
        service.startObserving();
        stoppedObserving = false;
    });
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    describe('getActivePartsObs', () => {
        it('should notify about new parts', fakeAsync(async() => {
            // Given a service where we are observing active parts
            let seenActiveParts: IPartId[] = [];
            const activePartsSub: Subscription = service.getActivePartsObs()
                .subscribe((activeParts: IPartId[]) => {
                    seenActiveParts = activeParts;
                });

            // When a new part is added
            const part: IPart = {
                listMoves: [],
                playerZero: 'creator',
                playerOne: 'firstCandidate',
                result: 5,
                turn: 0,
                typeGame: 'P4',
            };
            await partDAO.create(part);

            // Then the new part should have been observed
            expect(seenActiveParts.length).toBe(1);
            expect(seenActiveParts[0].doc).toEqual(part);

            activePartsSub.unsubscribe();
        }));
        it('should not notify about new parts when we stopped observing', fakeAsync(async() => {
            // Given a service where we were observing active parts, but have stopped observing
            let seenActiveParts: IPartId[] = [];
            const activePartsSub: Subscription = service.getActivePartsObs()
                .subscribe((activeParts: IPartId[]) => {
                    seenActiveParts = activeParts;
                });
            service.stopObserving();
            stoppedObserving = true;
            tick(3000);

            // When a new part is added
            const part: IPart = {
                listMoves: [],
                playerZero: 'creator',
                playerOne: 'firstCandidate',
                result: 5,
                turn: 0,
                typeGame: 'P4',
            };
            await partDAO.create(part);

            // Then the new part should not have been observed
            expect(seenActiveParts.length).toBe(0);

            activePartsSub.unsubscribe();
        }));
        it('should notify about deleted parts', fakeAsync(async() => {
            // Given that we are observing active parts, and there is already one part
            const part: IPart = {
                listMoves: [],
                playerZero: 'creator',
                playerOne: 'firstCandidate',
                result: 5,
                turn: 0,
                typeGame: 'P4',
            };
            const partId: string = await partDAO.create(part);
            let seenActiveParts: IPartId[] = [];
            const activePartsSub: Subscription = service.getActivePartsObs()
                .subscribe((activeParts: IPartId[]) => {
                    seenActiveParts = activeParts;
                });

            // When an existing part is deleted
            await partDAO.delete(partId);

            // Then the deleted part should not be considered as an active part
            expect(seenActiveParts.length).toBe(0);

            activePartsSub.unsubscribe();
        }));
        it('should preserve non-deleted upon a deletion', fakeAsync(async() => {
            // Given a service observing active parts, and there are already multiple parts
            const part: IPart = {
                listMoves: [],
                playerZero: 'creator',
                playerOne: 'firstCandidate',
                result: 5,
                turn: 0,
                typeGame: 'P4',
            };
            const partToBeDeleted: string = await partDAO.create(part);
            const partThatWillRemain: string = await partDAO.create(part);
            let seenActiveParts: IPartId[] = [];
            const activePartsSub: Subscription = service.getActivePartsObs()
                .subscribe((activeParts: IPartId[]) => {
                    seenActiveParts = activeParts;
                });

            // When an (but not all) existing part is deleted
            await partDAO.delete(partToBeDeleted);

            // Then only the non-deleted part should remain
            expect(seenActiveParts.length).toBe(1);
            expect(seenActiveParts[0].id).toBe(partThatWillRemain);

            activePartsSub.unsubscribe();
        }));
        it('should update when a part is modified', fakeAsync(async() => {
            // Given that we are observing active parts, and there is already one part
            const part: IPart = {
                listMoves: [],
                playerZero: 'creator',
                playerOne: 'firstCandidate',
                result: 5,
                turn: 0,
                typeGame: 'P4',
            };
            const partId: string = await partDAO.create(part);
            let seenActiveParts: IPartId[] = [];
            const activePartsSub: Subscription = service.getActivePartsObs()
                .subscribe((activeParts: IPartId[]) => {
                    seenActiveParts = activeParts;
                });

            // When an existing part is updated
            await partDAO.update(partId, { turn: 1 });

            // Then the new part should have been observed
            expect(seenActiveParts.length).toBe(1);
            expect(Utils.getNonNullable(seenActiveParts[0].doc).turn).toBe(1);

            activePartsSub.unsubscribe();
        }));
        it('should update only the modified part', fakeAsync(async() => {
            // Given that we are observing active parts, and there is already one part
            const part: IPart = {
                listMoves: [],
                playerZero: 'creator',
                playerOne: 'firstCandidate',
                result: 5,
                turn: 0,
                typeGame: 'P4',
            };
            const partToBeModified: string = await partDAO.create(part);
            const partThatWontChange: string = await partDAO.create(part);
            let seenActiveParts: IPartId[] = [];
            const activePartsSub: Subscription = service.getActivePartsObs()
                .subscribe((activeParts: IPartId[]) => {
                    seenActiveParts = activeParts;
                });

            // When an existing part is updated
            await partDAO.update(partToBeModified, { turn: 1 });

            // Then the part should have been updated
            expect(seenActiveParts.length).toBe(2);
            const newPart1: IPartId = Utils.getNonNullable(seenActiveParts.find((part: IPartId) =>
                part.id === partToBeModified));
            const newPart2: IPartId = Utils.getNonNullable(seenActiveParts.find((part: IPartId) =>
                part.id === partThatWontChange));
            expect(Utils.getNonNullable(newPart1.doc).turn).toBe(1);
            // and the other one should still be there and still be the same
            expect(Utils.getNonNullable(newPart2.doc).turn).toBe(0);

            activePartsSub.unsubscribe();
        }));
    });
    afterEach(() => {
        if (stoppedObserving === false) {
            service.stopObserving();
        }
    });
});
