import { ICurrentPart, PICurrentPart, ICurrentPartId } from "src/app/domain/icurrentpart";
import { FirebaseFirestoreDAOMock } from "../firebasefirestoredao/FirebaseFirestoreDAOMock";
import { MGPStr } from "src/app/collectionlib/mgpstr/MGPStr";
import { ObservableSubject } from "src/app/collectionlib/ObservableSubject";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { FirebaseCollectionObserver } from "../FirebaseCollectionObserver";
import { display } from "src/app/collectionlib/utils";

interface PartOS extends ObservableSubject<ICurrentPartId> {}

export class PartDAOMock extends FirebaseFirestoreDAOMock<ICurrentPart, PICurrentPart> {

    public static VERBOSE: boolean = false;

    private static partDB: MGPMap<MGPStr, PartOS>;

    public constructor() {
        super("PartDAOMock", PartDAOMock.VERBOSE);
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, "PartDAOMock.constructor");
    }
    public getStaticDB(): MGPMap<MGPStr, PartOS> {
        return PartDAOMock.partDB;
    }
    public resetStaticDB() {
        PartDAOMock.partDB = new MGPMap();
    }
    public observeActivesParts(callback: FirebaseCollectionObserver<ICurrentPart>): () => void {
        return () => {}; // TODO, observingWhere should be coded!
    }
}