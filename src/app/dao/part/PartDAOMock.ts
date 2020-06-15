import { ICurrentPart, PICurrentPart, ICurrentPartId } from "src/app/domain/icurrentpart";
import { FirebaseFirestoreDAOMock } from "../firebasefirestoredao/FirebaseFirestoreDAOMock";
import { MGPStr } from "src/app/collectionlib/mgpstr/MGPStr";
import { ObservableSubject } from "src/app/collectionlib/ObservableSubject";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";

interface PartOS extends ObservableSubject<ICurrentPartId> {}

export class PartDAOMock extends FirebaseFirestoreDAOMock<ICurrentPart, PICurrentPart> {

    public static VERBOSE: boolean = true;

    private static partDB: MGPMap<MGPStr, PartOS>;

    public constructor() {
        super("PartDAOMock", PartDAOMock.VERBOSE);
        if (this.VERBOSE) console.log("PartDAOMock.constructor");
    }
    public getStaticDB(): MGPMap<MGPStr, PartOS> {
        return PartDAOMock.partDB;
    }
    public resetStaticDB() {
        PartDAOMock.partDB = new MGPMap();
    }

    /*
    private static partDB: MGPMap<MGPStr, PartOS>;

    public static reset() {
        if (PartDAOMock.VERBOSE) {
            const removed: string = PartDAOMock.partDB ? 
            PartDAOMock.partDB.size() + " removed" :
                "not initialised yet";
            console.log("PartDAOMock.reset, " + removed);
        }
        PartDAOMock.partDB = new MGPMap();
    }
    public static getObservable(partId: string): Observable<ICurrentPartId> {
        if (PartDAOMock.VERBOSE) console.log("PartDAOMock.getObservable(" + partId + ")");

        const key: MGPStr = new MGPStr(partId);
        const optionalOS: MGPOptional<PartOS> = PartDAOMock.partDB.get(key);
        if (optionalOS.isPresent()) {
            return optionalOS.get().observable;
        } else {
            throw new Error("No part of id " + partId + " to observe"); // TODO: check that observing unexisting doc throws
        }
    }
    public static async read(partId: string): Promise<ICurrentPart> {
        if (PartDAOMock.VERBOSE) console.log("PartDAOMock.read(" + partId + ")");

        const key: MGPStr = new MGPStr(partId);
        const optionalOS: MGPOptional<PartOS> = PartDAOMock.partDB.get(key);
        if (optionalOS.isPresent()) {
            return optionalOS.get().subject.getValue().doc;
        } else {
            throw new Error("Cannot read element " + partId + " absent from PartMockDAO");
        }
    }
    public static async set(partId: string, doc: ICurrentPart): Promise<void> {
        if (PartDAOMock.VERBOSE) console.log("PartDAOMock.set(" + partId + ", " + JSON.stringify(doc) + ")");

        const key: MGPStr = new MGPStr(partId);
        let optionalOS: MGPOptional<PartOS> = PartDAOMock.partDB.get(key);
        const iPartId: ICurrentPartId = {id: partId, doc};
        if (optionalOS.isPresent()) {
            optionalOS.get().subject.next(iPartId);
        } else {
            const subject: BehaviorSubject<ICurrentPartId> = new BehaviorSubject<ICurrentPartId>(iPartId)
            const observable: Observable<ICurrentPartId> = subject.asObservable();
            PartDAOMock.partDB.put(key, { observable, subject });
        }
        return Promise.resolve();
    }
    public static async update(partId: string, update: PICurrentPart): Promise<void> {
        if (PartDAOMock.VERBOSE) console.log("PartDAOMock.update(" + partId + ", " + JSON.stringify(update) + ")");

        const key: MGPStr = new MGPStr(partId);
        const optionalOS: MGPOptional<PartOS> = PartDAOMock.partDB.get(key);
        if (optionalOS.isPresent()) {
            const observableSubject: PartOS = optionalOS.get();
            const oldDoc: ICurrentPart = observableSubject.subject.getValue().doc;
            const newDoc: ICurrentPart = { ...oldDoc, ...update };
            observableSubject.subject.next({ id: partId, doc: newDoc });
            return Promise.resolve();
        } else {
            throw new Error("Cannot update unexisting file "+ partId);
        }
    }
    public static async delete(partId: string): Promise<void> {
        if (PartDAOMock.VERBOSE) console.log("PartDAOMock.delete(" + partId + ")");

        const key: MGPStr = new MGPStr(partId);
        const optionalOS: MGPOptional<PartOS> = PartDAOMock.partDB.get(key);
        if (optionalOS.isPresent()) {
            optionalOS.get().subject.next(null);
            PartDAOMock.partDB.delete(key);
        } else {
            throw new Error("Cannot delete unexisting file "+ partId);
        }
    }
    public constructor() {
        if (PartDAOMock.VERBOSE) console.log("PartDAOMock.constructor");
        PartDAOMock.reset();
    }
    public getObservable(partId: string): Observable<ICurrentPartId> {
        return PartDAOMock.getObservable(partId);
    }
    public async read(id: string): Promise<ICurrentPart> {
        return PartDAOMock.read(id);
    }
    public async set(partId: string, doc: ICurrentPart): Promise<void> {
        return PartDAOMock.set(partId, doc);
    }
    public async update(partId: string, update: PICurrentPart): Promise<void> {
        return PartDAOMock.update(partId, update);
    }
    public async delete(partId: string): Promise<void> {
        return PartDAOMock.delete(partId);
    } */
}