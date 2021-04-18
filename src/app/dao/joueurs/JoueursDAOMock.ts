import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPStr } from 'src/app/utils/mgp-str/MGPStr';
import { ObservableSubject } from 'src/app/utils/collection-lib/ObservableSubject';
import { FirebaseFirestoreDAOMock } from '../firebase-firestore-dao/FirebaseFirestoreDAOMock';
import { IJoueurId, IJoueur, PIJoueur } from 'src/app/domain/iuser';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { display } from 'src/app/utils/utils/utils';

type JoueursOS = ObservableSubject<IJoueurId>

export class JoueursDAOMock extends FirebaseFirestoreDAOMock<IJoueur, PIJoueur> {
    public static VERBOSE: boolean = false;

    private static joueursDB: MGPMap<MGPStr, JoueursOS>;

    public constructor() {
        super('JoueursDAOMock', JoueursDAOMock.VERBOSE);
        display(this.VERBOSE, 'JoueursDAOMock.constructor');
    }
    public getStaticDB(): MGPMap<MGPStr, JoueursOS> {
        return JoueursDAOMock.joueursDB;
    }
    public resetStaticDB(): void {
        JoueursDAOMock.joueursDB = new MGPMap();
    }
    public observeUserByPseudo(pseudo: string, callback: FirebaseCollectionObserver<IJoueur>): () => void {
        return this.observingWhere('pseudo', '==', pseudo, callback);
    }
    public observeActivesUsers(callback: FirebaseCollectionObserver<IJoueur>): () => void {
        return this.observingWhere('state', '==', 'online', callback);
    }
}
