/* eslint-disable max-lines-per-function */
import { ActivePartsService } from '../ActivePartsService';
import { PartDAO } from 'src/app/dao/PartDAO';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MGPResult, Part, PartDocument } from 'src/app/domain/Part';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { Utils } from 'src/app/utils/utils';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FirestoreCollectionObserver } from 'src/app/dao/FirestoreCollectionObserver';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { Subscription } from 'rxjs';
import { FirestoreCondition } from 'src/app/dao/FirestoreDAO';

describe('ActivePartsService', () => {

    let service: ActivePartsService;

    let partDAO: PartDAO;

    const part: Part = {
        lastUpdate: {
            index: 0,
            player: 0,
        },
        listMoves: [],
        playerZero: UserMocks.CREATOR_MINIMAL_USER,
        playerOne: UserMocks.OPPONENT_MINIMAL_USER,
        result: 5,
        turn: 0,
        typeGame: 'P4',
    };

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: PartDAO, useClass: PartDAOMock },
            ],
        }).compileComponents();
        partDAO = TestBed.inject(PartDAO);
        service = TestBed.inject(ActivePartsService);
    }));
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    describe('subscribeToActiveParts', () => {
        it('should notify about new parts', fakeAsync(async() => {
            // Given a service where we are observing active parts
            let seenActiveParts: PartDocument[] = [];
            const activePartsSubscription: Subscription = service.subscribeToActiveParts(
                (activeParts: PartDocument[]) => {
                    seenActiveParts = activeParts;
                });

            // When a new part is added
            await partDAO.create(part);

            // Then the new part should have been observed
            expect(seenActiveParts.length).toBe(1);
            expect(seenActiveParts[0].data).toEqual(part);

            activePartsSubscription.unsubscribe();
        }));
        it('should not notify about new parts when we unsubscribe', fakeAsync(async() => {
            // Given a service where we were observing active parts, but have unsubscribed
            let seenActiveParts: PartDocument[] = [];
            const activePartsSubscription: Subscription = service.subscribeToActiveParts(
                (activeParts: PartDocument[]) => {
                    seenActiveParts = activeParts;
                });
            activePartsSubscription.unsubscribe();
            tick(3000);

            // When a new part is added
            await partDAO.create(part);

            // Then the new part should not have been observed
            expect(seenActiveParts.length).toBe(0);
        }));
        it('should notify about deleted parts', fakeAsync(async() => {
            // Given that we are observing active parts, and there is already one part
            const partId: string = await partDAO.create(part);
            let seenActiveParts: PartDocument[] = [];
            const activePartsSubscription: Subscription = service.subscribeToActiveParts(
                (activeParts: PartDocument[]) => {
                    seenActiveParts = activeParts;
                });

            // When an existing part is deleted
            await partDAO.delete(partId);

            // Then the deleted part should not be considered as an active part
            expect(seenActiveParts.length).toBe(0);

            activePartsSubscription.unsubscribe();
        }));
        it('should preserve non-deleted upon a deletion', fakeAsync(async() => {
            // Given a service observing active parts, and there are already multiple parts
            const partToBeDeleted: string = await partDAO.create(part);
            const partThatWillRemain: string = await partDAO.create(part);
            let seenActiveParts: PartDocument[] = [];
            const activePartsSubscription: Subscription = service.subscribeToActiveParts(
                (activeParts: PartDocument[]) => {
                    seenActiveParts = activeParts;
                });

            // When one existing part is deleted
            await partDAO.delete(partToBeDeleted);

            // Then only the non-deleted part should remain
            expect(seenActiveParts.length).toBe(1);
            expect(seenActiveParts[0].id).toBe(partThatWillRemain);

            activePartsSubscription.unsubscribe();
        }));
        it('should update when a part is modified', fakeAsync(async() => {
            // Given that we are observing active parts, and there is already one part
            const partId: string = await partDAO.create(part);
            let seenActiveParts: PartDocument[] = [];
            const activePartsSubscription: Subscription = service.subscribeToActiveParts(
                (activeParts: PartDocument[]) => {
                    seenActiveParts = activeParts;
                });

            // When an existing part is updated
            await partDAO.update(partId, { turn: 1 });

            // Then the new part should have been observed
            expect(seenActiveParts.length).toBe(1);
            expect(Utils.getNonNullable(seenActiveParts[0].data).turn).toBe(1);

            activePartsSubscription.unsubscribe();
        }));
        it('should update only the modified part', fakeAsync(async() => {
            // Given that we are observing active parts, and there is already one part
            const partToBeModified: string = await partDAO.create(part);
            const partThatWontChange: string = await partDAO.create(part);
            let seenActiveParts: PartDocument[] = [];
            const activePartsSubscription: Subscription = service.subscribeToActiveParts(
                (activeParts: PartDocument[]) => {
                    seenActiveParts = activeParts;
                });

            // When an existing part is updated
            await partDAO.update(partToBeModified, { turn: 1 });

            // Then the part should have been updated
            expect(seenActiveParts.length).toBe(2);
            const newPart1: PartDocument = Utils.getNonNullable(seenActiveParts.find((part: PartDocument) =>
                part.id === partToBeModified));
            const newPart2: PartDocument = Utils.getNonNullable(seenActiveParts.find((part: PartDocument) =>
                part.id === partThatWontChange));
            expect(Utils.getNonNullable(newPart1.data).turn).toBe(1);
            // and the other one should still be there and still be the same
            expect(Utils.getNonNullable(newPart2.data).turn).toBe(0);

            activePartsSubscription.unsubscribe();
        }));
        it('should call observingWhere with the right condition', () => {
            // Given an ActiveUsersService
            spyOn(partDAO, 'observingWhere').and.callFake(
                (query: FirestoreCondition[], callback: FirestoreCollectionObserver<Part>): Subscription => {
                    const expectedParameters: FirestoreCondition[] = [
                        ['result', '==', MGPResult.UNACHIEVED.value],
                    ];
                    expect(query).toEqual(expectedParameters);
                    return new Subscription();
                });

            // When subscribing to the active users
            const subscription: Subscription = service.subscribeToActiveParts(() => {});
            // Then it should call observingWhere from the DAO with the right parameters
            expect(partDAO.observingWhere).toHaveBeenCalledTimes(1);
            subscription.unsubscribe();
        });
        it('should not duplicate parts when we subscribe a second time', fakeAsync(async() => {
            // Given an active part service where we subscribed in the past
            await partDAO.create(part);
            let seenActiveParts: PartDocument[] = [];
            let activePartsSubscription: Subscription = service.subscribeToActiveParts(
                (activeParts: PartDocument[]) => {
                    seenActiveParts = activeParts;
                });
            activePartsSubscription.unsubscribe();

            // When subscribing a second time
            activePartsSubscription = service.subscribeToActiveParts(
                (activeParts: PartDocument[]) => {
                    seenActiveParts = activeParts;
                });

            // Then there should be exactly one part seen
            expect(seenActiveParts.length).toBe(1);
            activePartsSubscription.unsubscribe();
        }));
    });
    describe('userHasActivePart', () => {
        const part: Part = {
            lastUpdate: {
                index: 0,
                player: 0,
            },
            typeGame: 'P4',
            playerZero: UserMocks.CREATOR_MINIMAL_USER,
            turn: 0,
            result: MGPResult.UNACHIEVED.value,
            listMoves: [],
        };
        it('should return true when user has an active part as player zero', fakeAsync(async() => {
            // Given a part where user is player zero
            await partDAO.create({ ...part, playerZero: UserMocks.CANDIDATE_MINIMAL_USER });
            // When checking if the user has an active part
            const result: boolean = await service.userHasActivePart(UserMocks.CANDIDATE_MINIMAL_USER);
            // Then it should return true
            expect(result).toBeTrue();
        }));
        it('should return true when user has an active part as player one', fakeAsync(async() => {
            // Given a part where user is player zero
            await partDAO.create({ ...part, playerOne: UserMocks.CANDIDATE_MINIMAL_USER });
            // When checking if the user has an active part
            const result: boolean = await service.userHasActivePart(UserMocks.CANDIDATE_MINIMAL_USER);
            // Then it should return true
            expect(result).toBeTrue();
        }));
        it('should return false when the user has no active part', fakeAsync(async() => {
            // Given a part where the user is not active
            await partDAO.create(part);
            // When checking if the user has an active part
            const result: boolean = await service.userHasActivePart(UserMocks.CANDIDATE_MINIMAL_USER);
            // Then it should return false
            expect(result).toBeFalse();
        }));
    });
});
