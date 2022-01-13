/* eslint-disable max-lines-per-function */
import { IPart, IPartId, MGPResult } from 'src/app/domain/icurrentpart';
import { FirebaseFirestoreDAOMock } from './FirebaseFirestoreDAOMock.spec';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { MGPMap } from 'src/app/utils/MGPMap';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';
import { display } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

type PartOS = ObservableSubject<MGPOptional<IPartId>>

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
    public observeActiveParts(callback: FirebaseCollectionObserver<IPart>): () => void {
        return this.observingWhere([['result', '==', MGPResult.UNACHIEVED.value]], callback);
    }
    public async userHasActivePart(username: string): Promise<boolean> {
        const partsAsPlayerZero: IPart[] = await this.findWhere([
            ['playerZero', '==', username],
            ['result', '==', MGPResult.UNACHIEVED.value]]);
        const partsAsPlayerOne: IPart[] = await this.findWhere([
            ['playerOne', '==', username],
            ['result', '==', MGPResult.UNACHIEVED.value]]);
        return partsAsPlayerZero.length > 0 || partsAsPlayerOne.length > 0;
    }
}
