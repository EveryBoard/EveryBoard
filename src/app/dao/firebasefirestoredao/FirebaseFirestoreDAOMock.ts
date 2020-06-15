import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { MGPStr } from "src/app/collectionlib/mgpstr/MGPStr";
import { ObservableSubject } from "src/app/collectionlib/ObservableSubject";
import { Observable, BehaviorSubject } from "rxjs";
import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";

export abstract class FirebaseFirestoreDAOMock<T, PT> {
    
    public static VERBOSE: boolean = false;

    // T is a full element

    // PT is a partially full element

    // Simple CRUDS

    constructor(
        private readonly collectionName: string,
        public VERBOSE: boolean,
    ) {
        this.reset();
    }

    public abstract getStaticDB(): MGPMap<MGPStr, ObservableSubject<{id: string, doc: T}>>;

    public abstract resetStaticDB(): void;

    public reset() {
        if (this.VERBOSE) {
            const removed: string = this.getStaticDB() ? 
                this.getStaticDB().size() + " removed" :
                "not initialised yet";
            console.log(this.collectionName + ".reset, " + removed);
        }
        this.resetStaticDB();
    }
    public getObservable(id: string): Observable<{id: string, doc: T}> {
        if (this.VERBOSE) console.log(this.collectionName + ".getObservable(" + id + ")");

        const key: MGPStr = new MGPStr(id);
        const optionalOS: MGPOptional<ObservableSubject<{id: string, doc: T}>> = this.getStaticDB().get(key);
        if (optionalOS.isPresent()) {
            return optionalOS.get().observable;
        } else {
            throw new Error("No joiner of id " + id + " to observe"); // TODO: check that observing unexisting doc throws
        }
    }
    public async read(id: string): Promise<T> {
        if (this.VERBOSE) console.log(this.collectionName + ".read(" + id + ")");

        const key: MGPStr = new MGPStr(id);
        const optionalOS: MGPOptional<ObservableSubject<{id: string, doc: T}>> = this.getStaticDB().get(key);
        if (optionalOS.isPresent()) {
            return optionalOS.get().subject.getValue().doc;
        } else {
            throw new Error("Cannot read element " + id + " absent from " + this.collectionName);
        }
    }
    public async set(id: string, doc: T): Promise<void> {
        if (this.VERBOSE) console.log(this.collectionName + ".set(" + id + ", " + JSON.stringify(doc) + ")");

        const key: MGPStr = new MGPStr(id);
        let optionalOS: MGPOptional<ObservableSubject<{id: string, doc: T}>> = this.getStaticDB().get(key);
        const tid: {id: string, doc: T} = {id, doc};
        if (optionalOS.isPresent()) {
            optionalOS.get().subject.next(tid);
        } else {
            const subject: BehaviorSubject<{id: string, doc: T}> = new BehaviorSubject<{id: string, doc: T}>(tid)
            const observable: Observable<{id: string, doc: T}> = subject.asObservable();
            this.getStaticDB().put(key, { observable, subject });
        }
        return Promise.resolve();
    }
    public async update(id: string, update: PT): Promise<void> {
        if (this.VERBOSE) console.log(this.collectionName + ".update(" + id + ", " + JSON.stringify(update) + ")");

        const key: MGPStr = new MGPStr(id);
        const optionalOS: MGPOptional<ObservableSubject<{id: string, doc: T}>> = this.getStaticDB().get(key);
        if (optionalOS.isPresent()) {
            const observableSubject: ObservableSubject<{id: string, doc: T}> = optionalOS.get();
            const oldDoc: T = observableSubject.subject.getValue().doc;
            const newDoc: T = { ...oldDoc, ...update };
            observableSubject.subject.next({ id, doc: newDoc });
            return Promise.resolve();
        } else {
            throw new Error("Cannot update element " + id + " absent from " + this.collectionName);
        }
    }
    public async delete(id: string): Promise<void> {
        if (this.VERBOSE) console.log(this.collectionName + ".delete(" + id + ")");

        const key: MGPStr = new MGPStr(id);
        const optionalOS: MGPOptional<ObservableSubject<{id: string, doc: T}>> = this.getStaticDB().get(key);
        if (optionalOS.isPresent()) {
            optionalOS.get().subject.next(null);
            this.getStaticDB().delete(key);
        } else {
            throw new Error("Cannot delete element " + id + " absent from " + this.collectionName);
        }
    }
}