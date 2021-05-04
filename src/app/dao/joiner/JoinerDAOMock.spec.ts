import { IJoinerId, IJoiner, PIJoiner } from 'src/app/domain/ijoiner';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { ObservableSubject } from 'src/app/utils/collection-lib/ObservableSubject';
import { display } from 'src/app/utils/utils/utils';
import { FirebaseFirestoreDAOMock } from '../firebase-firestore-dao/FirebaseFirestoreDAOMock.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';

type JoinerOS = ObservableSubject<IJoinerId>

export class JoinerDAOMock extends FirebaseFirestoreDAOMock<IJoiner, PIJoiner> {
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
    let joinerDaoMock: JoinerDAOMock;

    let callCount: number;

    let lastJoiner: IJoiner;

    beforeEach(() => {
        joinerDaoMock = new JoinerDAOMock();
        callCount = 0;
        lastJoiner = null;
    });
    it('Total update should update', async() => {
        await joinerDaoMock.set('joinerId', JoinerMocks.INITIAL.copy());

        expect(lastJoiner).toBeNull();
        expect(callCount).toBe(0);

        joinerDaoMock.getObsById('joinerId').subscribe((iJoinerId: IJoinerId) => {
            callCount++;
            lastJoiner = iJoinerId.doc;
            expect(callCount).toBeLessThanOrEqual(2, 'Should not have been called more than twice');
            // TODO: REDO
        });

        expect(callCount).toEqual(1);
        expect(lastJoiner).toEqual(JoinerMocks.INITIAL.copy());

        await joinerDaoMock.update('joinerId', JoinerMocks.WITH_FIRST_CANDIDATE.copy());

        expect(callCount).toEqual(2);
        expect(lastJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE.copy());
    });
    it('Partial update should update', async() => {
        await joinerDaoMock.set('joinerId', JoinerMocks.INITIAL.copy());

        expect(callCount).toEqual(0);
        expect(lastJoiner).toBeNull();

        joinerDaoMock.getObsById('joinerId').subscribe((iJoinerId: IJoinerId) => {
            callCount ++;
            // TODO: REDO
            expect(callCount).toBeLessThanOrEqual(2, 'Should not have been called more than twice');
            lastJoiner = iJoinerId.doc;
        });

        expect(callCount).toEqual(1);
        expect(lastJoiner).toEqual(JoinerMocks.INITIAL.copy());

        await joinerDaoMock.update('joinerId', { candidatesNames: ['firstCandidate'] });

        expect(callCount).toEqual(2);
        expect(lastJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE.copy());
    });
});
