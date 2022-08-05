/* eslint-disable max-lines-per-function */
import { Joiner, JoinerDocument } from 'src/app/domain/Joiner';
import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { display } from 'src/app/utils/utils';
import { FirestoreDAOMock } from './FirestoreDAOMock.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { fakeAsync } from '@angular/core/testing';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Unsubscribe } from '@angular/fire/firestore';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { UserMocks } from 'src/app/domain/UserMocks.spec';

type JoinerOS = ObservableSubject<MGPOptional<JoinerDocument>>

export class JoinerDAOMock extends FirestoreDAOMock<Joiner> {

    public static VERBOSE: boolean = false;

    private static joinerDB: MGPMap<string, JoinerOS>;

    public constructor() {
        super('JoinerDAOMock', JoinerDAOMock.VERBOSE);
        display(this.VERBOSE, 'JoinerDAOMock.constructor');
    }
    public addCandidate(partId: string, candidate: MinimalUser): Promise<void> {
        return this.subCollectionDAO(partId, 'candidates').set(candidate.id, candidate);
    }
    public removeCandidate(partId: string, candidate: MinimalUser): Promise<void> {
        return this.subCollectionDAO(partId, 'candidates').delete(candidate.id);
    }
    public getStaticDB(): MGPMap<string, JoinerOS> {
        return JoinerDAOMock.joinerDB;
    }
    public resetStaticDB(): void {
        JoinerDAOMock.joinerDB = new MGPMap();
    }
}

describe('JoinerDAOMock', () => {

    let joinerDAOMock: JoinerDAOMock;

    let callCount: number;

    let lastJoiner: MGPOptional<Joiner>;

    beforeEach(() => {
        joinerDAOMock = new JoinerDAOMock();
        callCount = 0;
        lastJoiner = MGPOptional.empty();
    });
    it('Total update should update', fakeAsync(async() => {
        // Given an initial joiner to which we subscribed
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL);

        expect(lastJoiner).toEqual(MGPOptional.empty());
        expect(callCount).toBe(0);

        const unsubscribe: Unsubscribe = joinerDAOMock.subscribeToChanges('joinerId', (joiner: MGPOptional<Joiner>) => {
            callCount++;
            lastJoiner = joiner;
            expect(callCount).withContext('Should not have been called more than twice').toBeLessThanOrEqual(2);
        });

        expect(callCount).toEqual(1);
        expect(lastJoiner.get()).toEqual(JoinerMocks.INITIAL);

        // When it is updated
        await joinerDAOMock.update('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);

        // Then we should have seen the update
        expect(callCount).toEqual(2);
        expect(lastJoiner.get()).toEqual(JoinerMocks.WITH_CHOSEN_OPPONENT);
        unsubscribe();
    }));
    it('Partial update should update', fakeAsync(async() => {
        // Given an initial joiner to which we subscribed
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL);

        expect(callCount).toEqual(0);
        expect(lastJoiner).toEqual(MGPOptional.empty());

        const unsubscribe: Unsubscribe = joinerDAOMock.subscribeToChanges('joinerId', (joiner: MGPOptional<Joiner>) => {
            callCount++;
            expect(callCount).withContext('Should not have been called more than twice').toBeLessThanOrEqual(2);
            lastJoiner = joiner;
        });

        expect(callCount).toEqual(1);
        expect(lastJoiner.get()).toEqual(JoinerMocks.INITIAL);

        // When it is updated
        await joinerDAOMock.update('joinerId', { chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER });

        // Then we should see the update
        expect(callCount).toEqual(2);
        expect(lastJoiner.get()).toEqual(JoinerMocks.WITH_CHOSEN_OPPONENT);
        unsubscribe();
    }));
});
