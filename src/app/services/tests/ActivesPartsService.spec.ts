/* eslint-disable max-lines-per-function */
import { ActivesPartsService } from '../ActivesPartsService';
import { PartDAO } from 'src/app/dao/PartDAO';
import { fakeAsync } from '@angular/core/testing';
import { ICurrentPartId, IPart } from 'src/app/domain/icurrentpart';
import { Subscription } from 'rxjs';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { Utils } from 'src/app/utils/utils';

describe('ActivesPartsService', () => {

    let service: ActivesPartsService;

    let partDAO: PartDAO;

    beforeEach(async() => {
        partDAO = new PartDAOMock() as unknown as PartDAO;
        service = new ActivesPartsService(partDAO);
    });
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    describe('hasActiveParts', () => {
        it('should return true when user is playerZero in a game', fakeAsync(async() => {
            // Given a partDao including an active part whose playerZero is our user
            const user: string = 'creator';
            await partDAO.set('joinerId', {
                listMoves: [],
                playerZero: user,
                playerOne: 'firstCandidate',
                result: 5,
                turn: 0,
                typeGame: 'P4',
            });

            // when asking if the user has an active part
            const hasUserActiveParts: boolean = service.hasActivePart(user);

            // then the user has an active part
            expect(hasUserActiveParts).toBeTrue();
        }));
        it('should return true when user is playerOne in a game', fakeAsync(async() => {
            // Given a partDao including an active part whose playerZero is our user
            const user: string = 'creator';
            await partDAO.set('joinerId', {
                listMoves: [],
                playerZero: 'firstCandidate',
                playerOne: user,
                result: 5,
                turn: 0,
                typeGame: 'P4',
            });

            // when asking hasActivePart('our user')
            const hasUserActiveParts: boolean = service.hasActivePart(user);

            // then we should learn that yes, he has some
            expect(hasUserActiveParts).toBeTrue();
        }));
        it('should return false when user is not in a game', fakeAsync(async() => {
            // Given a partDao including active parts without our user
            const user: string = 'creator';
            await partDAO.set('joinerId', {
                listMoves: [],
                playerZero: 'someUser',
                playerOne: 'someOtherUser',
                result: 5,
                turn: 0,
                typeGame: 'P4',
            });

            // when asking hasActivePart('our user')
            const hasUserActiveParts: boolean = service.hasActivePart(user);

            // then we should learn that yes, he has some
            expect(hasUserActiveParts).toBeFalse();
        }));
    });
    describe('getActivePartsObs', () => {
        it('should notify about new parts', async() => {
            // Given that we are observing active parts
            let seenActiveParts: ICurrentPartId[] = [];
            const activePartsSub: Subscription = service.getActivePartsObs()
                .subscribe((activeParts: ICurrentPartId[]) => {
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

            // Then the new part has been observed
            expect(seenActiveParts.length).toBe(1);
            expect(seenActiveParts[0].doc).toEqual(part);

            activePartsSub.unsubscribe();
        });
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
            let seenActiveParts: ICurrentPartId[] = [];
            const activePartsSub: Subscription = service.getActivePartsObs()
                .subscribe((activeParts: ICurrentPartId[]) => {
                    seenActiveParts = activeParts;
                });

            // When an existing part is deleted
            await partDAO.delete(partId);

            // Then the deleted part is not considered as an active part
            expect(seenActiveParts.length).toBe(0);

            activePartsSub.unsubscribe();
        }));
        it('should preserve non-deleted upon a deletion', fakeAsync(async() => {
            // Given that we are observing active parts, and there are already multiple parts
            const part: IPart = {
                listMoves: [],
                playerZero: 'creator',
                playerOne: 'firstCandidate',
                result: 5,
                turn: 0,
                typeGame: 'P4',
            };
            const partId1: string = await partDAO.create(part);
            const partId2: string = await partDAO.create(part);
            let seenActiveParts: ICurrentPartId[] = [];
            const activePartsSub: Subscription = service.getActivePartsObs()
                .subscribe((activeParts: ICurrentPartId[]) => {
                    seenActiveParts = activeParts;
                });

            // When an (but not all) existing part is deleted
            await partDAO.delete(partId1);

            // Then only the non-deleted part remains
            expect(seenActiveParts.length).toBe(1);
            expect(seenActiveParts[0].id).toBe(partId2);

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
            let seenActiveParts: ICurrentPartId[] = [];
            const activePartsSub: Subscription = service.getActivePartsObs()
                .subscribe((activeParts: ICurrentPartId[]) => {
                    seenActiveParts = activeParts;
                });

            // When an existing part is updated
            await partDAO.update(partId, { turn: 1 });

            // Then the new part has been observed
            expect(seenActiveParts.length).toBe(1);
            expect(seenActiveParts[0].doc.turn).toBe(1);

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
            const partId1: string = await partDAO.create(part);
            const partId2: string = await partDAO.create(part);
            let seenActiveParts: ICurrentPartId[] = [];
            const activePartsSub: Subscription = service.getActivePartsObs()
                .subscribe((activeParts: ICurrentPartId[]) => {
                    seenActiveParts = activeParts;
                });

            // When an existing part is updated
            await partDAO.update(partId1, { turn: 1 });

            // Then the part has been updated
            expect(seenActiveParts.length).toBe(2);
            const newPart1: ICurrentPartId = Utils.getNonNullable(seenActiveParts.find((part: ICurrentPartId) =>
                part.id === partId1));
            const newPart2: ICurrentPartId = Utils.getNonNullable(seenActiveParts.find((part: ICurrentPartId) =>
                part.id === partId2));
            expect(newPart1.doc.turn).toBe(1);
            // and the other one is still there and still the same
            expect(newPart2.doc.turn).toBe(0);

            activePartsSub.unsubscribe();
        }));
    });
    afterEach(() => {
        service.ngOnDestroy();
    });
});
