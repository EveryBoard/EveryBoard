/* eslint-disable max-lines-per-function */
import { Joiner, JoinerDocument } from 'src/app/domain/Joiner';
import { MGPMap } from 'src/app/utils/MGPMap';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { display } from 'src/app/utils/utils';
import { FirebaseFirestoreDAOMock } from './FirebaseFirestoreDAOMock.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { fakeAsync } from '@angular/core/testing';
import { MGPOptional } from 'src/app/utils/MGPOptional';

type JoinerOS = ObservableSubject<MGPOptional<JoinerDocument>>

export class JoinerDAOMock extends FirebaseFirestoreDAOMock<Joiner> {

    public static VERBOSE: boolean = false;

    private static joinerDB: MGPMap<string, JoinerOS>;

    public constructor() {
        super('JoinerDAOMock', JoinerDAOMock.VERBOSE);
        display(this.VERBOSE, 'JoinerDAOMock.constructor');
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
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL);

        expect(lastJoiner).toEqual(MGPOptional.empty());
        expect(callCount).toBe(0);

        joinerDAOMock.getObsById('joinerId').subscribe((joiner: MGPOptional<Joiner>) => {
            callCount++;
            lastJoiner = joiner;
            expect(callCount).withContext('Should not have been called more than twice').toBeLessThanOrEqual(2);
            // TODO: REDO
        });

        expect(callCount).toEqual(1);
        expect(lastJoiner.get()).toEqual(JoinerMocks.INITIAL);

        await joinerDAOMock.update('joinerId', JoinerMocks.WITH_FIRST_CANDIDATE);

        expect(callCount).toEqual(2);
        expect(lastJoiner.get()).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);
    }));
    it('Partial update should update', fakeAsync(async() => {
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL);

        expect(callCount).toEqual(0);
        expect(lastJoiner).toEqual(MGPOptional.empty());

        joinerDAOMock.getObsById('joinerId').subscribe((joiner: MGPOptional<Joiner>) => {
            callCount++;
            // TODO: REDO
            expect(callCount).withContext('Should not have been called more than twice').toBeLessThanOrEqual(2);
            lastJoiner = joiner;
        });

        expect(callCount).toEqual(1);
        expect(lastJoiner.get()).toEqual(JoinerMocks.INITIAL);

        await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });

        expect(callCount).toEqual(2);
        expect(lastJoiner.get()).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE);
    }));
});
