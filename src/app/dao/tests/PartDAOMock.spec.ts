/* eslint-disable max-lines-per-function */
import { Part, PartDocument } from 'src/app/domain/Part';
import { FirestoreDAOMock } from './FirestoreDAOMock.spec';
import { ObservableSubject } from '@everyboard/lib';
import { MGPMap } from '@everyboard/lib';
import { MGPOptional } from '@everyboard/lib';
import { Debug } from 'src/app/utils/Debug';

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
