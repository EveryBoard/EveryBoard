/* eslint-disable max-lines-per-function */
import { Part, PartDocument } from 'src/app/domain/Part';
import { FirestoreDAOMock } from './FirestoreDAOMock.spec';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Debug } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

type PartOS = ObservableSubject<MGPOptional<PartDocument>>

@Debug.log
export class PartDAOMock extends FirestoreDAOMock<Part> {

    private static partDB: MGPMap<string, PartOS>;

    public constructor() {
        super('PartDAOMock');
    }
    public getStaticDB(): MGPMap<string, PartOS> {
        return PartDAOMock.partDB;
    }
    public resetStaticDB(): void {
        PartDAOMock.partDB = new MGPMap();
    }
}
