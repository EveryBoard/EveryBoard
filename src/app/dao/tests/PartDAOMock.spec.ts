/* eslint-disable max-lines-per-function */
import { ICurrentPartId, IPart, MGPResult } from 'src/app/domain/icurrentpart';
import { FirebaseFirestoreDAOMock } from './FirebaseFirestoreDAOMock.spec';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { MGPMap } from 'src/app/utils/MGPMap';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { display } from 'src/app/utils/utils';
import { Player } from 'src/app/jscaip/Player';

type PartOS = ObservableSubject<ICurrentPartId>

export class PartDAOMock extends FirebaseFirestoreDAOMock<IPart> {

    public static VERBOSE: boolean = false;

    private static partDB: MGPMap<string, PartOS>;

    public constructor() {
        super('PartDAOMock', PartDAOMock.VERBOSE);
        display(this.VERBOSE || FirebaseFirestoreDAOMock.VERBOSE, 'PartDAOMock.constructor');
    }
    public getStaticDB(): MGPMap<string, PartOS> {
        return PartDAOMock.partDB;
    }
    public resetStaticDB(): void {
        PartDAOMock.partDB = new MGPMap();
    }
    public async updateAndBumpIndex(id: string,
                                    user: Player,
                                    lastIndex: number,
                                    update: Partial<IPart>)
    : Promise<void>
    {
        update = {
            ...update,
            lastUpdate: {
                index: lastIndex + 1,
                player: user.value,
            },
        };
        return this.update(id, update);
    }
    public observeActivesParts(callback: FirebaseCollectionObserver<IPart>): () => void {
        return this.observingWhere([['result', '==', MGPResult.UNACHIEVED.value]], callback);
    }
}
