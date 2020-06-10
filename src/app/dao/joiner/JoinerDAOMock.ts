import { Observable, of, BehaviorSubject, observable } from "rxjs";
import { IJoinerId, IJoiner, PIJoiner } from "src/app/domain/ijoiner";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";
import { MGPStr } from "src/app/collectionlib/mgpstr/MGPStr";

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

interface ObservableSubject {

    subject: BehaviorSubject<IJoinerId>,

    observable: Observable<IJoinerId>
}

export class JoinerDAOMock {

    public static VERBOSE: boolean = false;

    private static joinerDB: MGPMap<MGPStr, IJoiner> = new MGPMap();

    private static joinerObservables: MGPMap<MGPStr, ObservableSubject> = new MGPMap();

    public constructor() {
        if (JoinerDAOMock.VERBOSE) console.log("JoinerDAOMock.constructor");
    }

    public getObservable(joinerId: string): Observable<IJoinerId> {
        if (JoinerDAOMock.VERBOSE) console.log("JoinerDAOMock.getObservable");
        const key: MGPStr = new MGPStr(joinerId);
        const optionalDoc: MGPOptional<IJoiner> = JoinerDAOMock.joinerDB.get(key);
        if (optionalDoc.isPresent()) {
            const doc: IJoiner = optionalDoc.get();
            let optionalOS: MGPOptional<ObservableSubject>;
            optionalOS = JoinerDAOMock.joinerObservables.get(key);
            let observableSubject: ObservableSubject;
            if (optionalOS.isPresent()) {
                observableSubject = optionalOS.get();
            } else {
                const subject: BehaviorSubject<IJoinerId> = new BehaviorSubject<IJoinerId>({ id: joinerId, joiner: doc});
                const observable: Observable<IJoinerId> = subject.asObservable();
                observableSubject = { subject, observable}
                JoinerDAOMock.joinerObservables.set(key, observableSubject);
            }
            return observableSubject.observable;

        } else {
            throw new Error("No joiner of id " + joinerId + " to observe"); // TODO: check that observing unexisting doc throws
        }
    }
    public async read(id: string): Promise<IJoiner> {
        if (JoinerDAOMock.VERBOSE) console.log("JoinerDAOMock.read");

        const key: MGPStr = new MGPStr(id);
        return new Promise<IJoiner>((resolve, reject) => {
            const optionalJoiner: MGPOptional<IJoiner> = JoinerDAOMock.joinerDB.get(key);
            if (optionalJoiner.isPresent()) {
                resolve(optionalJoiner.get());
            } else {
                reject("No element element " + id + " found in JoinerMockDAO");
            }
        });
    }
    public async set(partId: string, joiner: IJoiner): Promise<void> {
        if (JoinerDAOMock.VERBOSE) console.log("JoinerDAOMock.set");

        JoinerDAOMock.joinerDB.put(new MGPStr(partId), joiner);
    }
    public async update(partId: string, update: PIJoiner): Promise<void> {
        if (JoinerDAOMock.VERBOSE) console.log("JoinerDAOMock.update");

        const optionalDoc: MGPOptional<IJoiner> = JoinerDAOMock.joinerDB.get(new MGPStr(partId));
        if (optionalDoc.isPresent()) {
            const oldDoc: IJoiner = optionalDoc.get();
            const newDoc: IJoiner = { ...oldDoc, ...update };
            JoinerDAOMock.joinerDB.replace(new MGPStr(partId), newDoc);
        } else {
            throw new Error("Cannot update unexisting file "+ partId);
        }
    }
}