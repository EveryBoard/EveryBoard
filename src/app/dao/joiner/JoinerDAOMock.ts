import { Observable, BehaviorSubject } from "rxjs";
import { IJoinerId, IJoiner, PIJoiner } from "src/app/domain/ijoiner";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";
import { MGPStr } from "src/app/collectionlib/mgpstr/MGPStr";
import { JoinerMocks } from "src/app/domain/JoinerMocks";
import { ObservableSubject } from "src/app/collectionlib/ObservableSubject";

export const fakeJoinerId: IJoinerId = { // TODO: clean
    id: "myJoinerId",
    joiner: {
        candidatesNames: ["chosenPlayer", "otherCandidate"],
        chosenPlayer: "chosenPlayer",
        creator: "creator",
        firstPlayer: "creator",
        partStatus: 5,
    },
};

interface JoinerOS extends ObservableSubject<IJoinerId> {}

export class JoinerDAOMock {

    public static VERBOSE: boolean = true;

    private static joinerDB: MGPMap<MGPStr, JoinerOS>;

    public static reset() {
        if (JoinerDAOMock.VERBOSE) {
            const removed: string = JoinerDAOMock.joinerDB ? 
                JoinerDAOMock.joinerDB.size() + " removed" :
                "not initialised yet";
            console.log("JoinerDAOMock.reset, " + removed);
        }
        JoinerDAOMock.joinerDB = new MGPMap();
    }
    public static getObservable(joinerId: string): Observable<IJoinerId> {
        if (JoinerDAOMock.VERBOSE) console.log("JoinerDAOMock.getObservable(" + joinerId + ")");

        const key: MGPStr = new MGPStr(joinerId);
        const optionalOS: MGPOptional<JoinerOS> = JoinerDAOMock.joinerDB.get(key);
        if (optionalOS.isPresent()) {
            return optionalOS.get().observable;
        } else {
            throw new Error("No joiner of id " + joinerId + " to observe"); // TODO: check that observing unexisting doc throws
        }
    }
    public static async read(joinerId: string): Promise<IJoiner> {
        if (JoinerDAOMock.VERBOSE) console.log("JoinerDAOMock.read(" + joinerId + ")");

        const key: MGPStr = new MGPStr(joinerId);
        const optionalOS: MGPOptional<JoinerOS> = JoinerDAOMock.joinerDB.get(key);
        if (optionalOS.isPresent()) {
            return optionalOS.get().subject.getValue().joiner;
        } else {
            throw new Error("Cannot read element " + joinerId + " absent from JoinerMockDAO");
        }
    }
    public static async set(joinerId: string, joiner: IJoiner): Promise<void> {
        if (JoinerDAOMock.VERBOSE) console.log("JoinerDAOMock.set(" + joinerId + ", " + JSON.stringify(joiner) + ")");

        const key: MGPStr = new MGPStr(joinerId);
        let optionalOS: MGPOptional<JoinerOS> = JoinerDAOMock.joinerDB.get(key);
        const iJoinerId: IJoinerId = {id: joinerId, joiner};
        if (optionalOS.isPresent()) {
            optionalOS.get().subject.next(iJoinerId);
        } else {
            const subject: BehaviorSubject<IJoinerId> = new BehaviorSubject<IJoinerId>(iJoinerId)
            const observable: Observable<IJoinerId> = subject.asObservable();
            JoinerDAOMock.joinerDB.put(key, { observable, subject });
        }
        return Promise.resolve();
    }
    public static async update(partId: string, update: PIJoiner): Promise<void> {
        if (JoinerDAOMock.VERBOSE) console.log("JoinerDAOMock.update(" + partId + ", " + JSON.stringify(update) + ")");

        const key: MGPStr = new MGPStr(partId);
        const optionalOS: MGPOptional<JoinerOS> = JoinerDAOMock.joinerDB.get(key);
        if (optionalOS.isPresent()) {
            const observableSubject: JoinerOS = optionalOS.get();
            const oldDoc: IJoiner = observableSubject.subject.getValue().joiner;
            const newDoc: IJoiner = { ...oldDoc, ...update };
            observableSubject.subject.next({ id: partId, joiner: newDoc });
            return Promise.resolve();
        } else {
            throw new Error("Cannot update unexisting file "+ partId);
        }
    }
    public static async delete(joinerId: string): Promise<void> {
        if (JoinerDAOMock.VERBOSE) console.log("JoinerDAOMock.delete(" + joinerId + ")");

        const key: MGPStr = new MGPStr(joinerId);
        const optionalOS: MGPOptional<JoinerOS> = JoinerDAOMock.joinerDB.get(key);
        if (optionalOS.isPresent()) {
            optionalOS.get().subject.next(null);
            JoinerDAOMock.joinerDB.delete(key);
        } else {
            throw new Error("Cannot delete unexisting file "+ joinerId);
        }
    }
    public constructor() {
        if (JoinerDAOMock.VERBOSE) console.log("JoinerDAOMock.constructor");
        JoinerDAOMock.reset();
    }
    public getObservable(joinerId: string): Observable<IJoinerId> {
        return JoinerDAOMock.getObservable(joinerId);
    }
    public async read(id: string): Promise<IJoiner> {
        return JoinerDAOMock.read(id);
    }
    public async set(partId: string, joiner: IJoiner): Promise<void> {
        return JoinerDAOMock.set(partId, joiner);
    }
    public async update(partId: string, update: PIJoiner): Promise<void> {
        return JoinerDAOMock.update(partId, update);
    }
    public async delete(partId: string): Promise<void> {
        return JoinerDAOMock.delete(partId);
    }
}