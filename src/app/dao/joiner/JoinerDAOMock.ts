import { IJoinerId, IJoiner, PIJoiner } from 'src/app/domain/ijoiner';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPStr } from 'src/app/utils/mgp-str/MGPStr';
import { ObservableSubject } from 'src/app/utils/collection-lib/ObservableSubject';
import { FirebaseFirestoreDAOMock } from '../firebase-firestore-dao/FirebaseFirestoreDAOMock';
import { display } from 'src/app/utils/utils/utils';

type JoinerOS = ObservableSubject<IJoinerId>

export class JoinerDAOMock extends FirebaseFirestoreDAOMock<IJoiner, PIJoiner> {
    public static VERBOSE: boolean = false;

    private static joinerDB: MGPMap<MGPStr, JoinerOS>;

    public constructor() {
        super('JoinerDAOMock', JoinerDAOMock.VERBOSE);
        display(this.VERBOSE, 'JoinerDAOMock.constructor');
    }
    public getStaticDB(): MGPMap<MGPStr, JoinerOS> {
        return JoinerDAOMock.joinerDB;
    }
    public resetStaticDB(): void {
        JoinerDAOMock.joinerDB = new MGPMap();
    }
}
