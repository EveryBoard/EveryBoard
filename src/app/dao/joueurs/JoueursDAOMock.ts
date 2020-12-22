import {MGPMap} from 'src/app/collectionlib/mgpmap/MGPMap';
import {MGPStr} from 'src/app/collectionlib/mgpstr/MGPStr';
import {ObservableSubject} from 'src/app/collectionlib/ObservableSubject';
import {FirebaseFirestoreDAOMock} from '../firebasefirestoredao/FirebaseFirestoreDAOMock';
import {IJoueurId, IJoueur, PIJoueur} from 'src/app/domain/iuser';
import {FirebaseCollectionObserver} from '../FirebaseCollectionObserver';
import {display} from 'src/app/collectionlib/utils';

interface JoueursOS extends ObservableSubject<IJoueurId> {}

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
    public resetStaticDB() {
        JoueursDAOMock.joueursDB = new MGPMap();
    }
    public observeUserByPseudo(pseudo: string, callback: FirebaseCollectionObserver<IJoueur>): () => void {
        const iJoueurId: IJoueurId = {
            id: 'firstCandidate',
            doc: {
                pseudo: 'firstCandidate',
            },
        };
        callback.onDocumentCreated([iJoueurId]);
        return () => {}; // TODO: use this.observingWhere
    }
    public observeActivesUsers(callback: FirebaseCollectionObserver<IJoueur>): () => void {
        return () => {}; // TODO: use this.observingWhere
    }
}
