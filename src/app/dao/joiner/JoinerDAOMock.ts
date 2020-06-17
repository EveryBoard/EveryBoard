import { IJoinerId, IJoiner, PIJoiner } from "src/app/domain/ijoiner";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { MGPStr } from "src/app/collectionlib/mgpstr/MGPStr";
import { ObservableSubject } from "src/app/collectionlib/ObservableSubject";
import { FirebaseFirestoreDAOMock } from "../firebasefirestoredao/FirebaseFirestoreDAOMock";

interface JoinerOS extends ObservableSubject<IJoinerId> {}

export class JoinerDAOMock extends FirebaseFirestoreDAOMock<IJoiner, PIJoiner> {

    public static VERBOSE: boolean = false;

    private static joinerDB: MGPMap<MGPStr, JoinerOS>;

    public constructor() {
        super("JoinerDAOMock", JoinerDAOMock.VERBOSE);
        if (this.VERBOSE) console.log("JoinerDAOMock.constructor");
    }
    public getStaticDB(): MGPMap<MGPStr, JoinerOS> {
        return JoinerDAOMock.joinerDB;
    }
    public resetStaticDB() {
        JoinerDAOMock.joinerDB = new MGPMap();
    }
}