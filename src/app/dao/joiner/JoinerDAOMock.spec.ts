import { JoinerDAOMock } from "./JoinerDAOMock";
import { IJoinerId, IJoiner } from "src/app/domain/ijoiner";
import { JoinerMocks } from "src/app/domain/JoinerMocks";

describe('JoinerDAOMock', () => {

    let joinerDaoMock: JoinerDAOMock;

    let callCount: number;

    let lastJoiner: IJoiner;

    beforeEach(() => {
        joinerDaoMock = new JoinerDAOMock();
        callCount = 0;
        lastJoiner = null;
    });
    it("Total update should update", async() => {
        await joinerDaoMock.set("joinerId", JoinerMocks.INITIAL.copy());

        expect(lastJoiner).toBeNull();
        expect(callCount).toBe(0);

        joinerDaoMock.getObsById("joinerId").subscribe((iJoinerId: IJoinerId) => {
            callCount++;
            lastJoiner = iJoinerId.doc;
            expect(callCount).toBeLessThanOrEqual(2 ,"Should not have been called more than twice");
            // TODO: REDO
        });

        expect(callCount).toEqual(1);
        expect(lastJoiner).toEqual(JoinerMocks.INITIAL.copy());

        await joinerDaoMock.update("joinerId", JoinerMocks.WITH_FIRST_CANDIDATE.copy());

        expect(callCount).toEqual(2);
        expect(lastJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE.copy());
    });
    it("Partial update should update", async() => {
        await joinerDaoMock.set("joinerId", JoinerMocks.INITIAL.copy());

        expect(callCount).toEqual(0);
        expect(lastJoiner).toBeNull();

        joinerDaoMock.getObsById("joinerId").subscribe((iJoinerId: IJoinerId) => {
            callCount ++;
            // TODO: REDO
            expect(callCount).toBeLessThanOrEqual(2, "Should not have been called more than twice");
            lastJoiner = iJoinerId.doc;
        });

        expect(callCount).toEqual(1);
        expect(lastJoiner).toEqual(JoinerMocks.INITIAL.copy());

        await joinerDaoMock.update("joinerId", { candidatesNames: ["firstCandidate"] });

        expect(callCount).toEqual(2);
        expect(lastJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE.copy());
    });
});