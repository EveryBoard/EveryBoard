/* eslint-disable max-lines-per-function */
import { MGPMap, MGPOptional, ObservableSubject } from '@everyboard/lib';

import { Part, PartDocument } from '../../domain/Part';
import { Debug } from '../../utils/Debug';

import { FirestoreDAOMock } from './FirestoreDAOMock.spec';

type PartOS = ObservableSubject<MGPOptional<PartDocument>>;

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
