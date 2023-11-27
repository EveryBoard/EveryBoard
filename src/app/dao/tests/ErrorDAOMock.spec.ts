import { FirestoreDAOMock } from 'src/app/dao/tests/FirestoreDAOMock.spec';
import { MGPMap } from '@everyboard/lib';
import { MGPOptional } from '@everyboard/lib';
import { ObservableSubject } from '@everyboard/lib';
import { JSONValue } from '@everyboard/lib';
import { ErrorDocument, MGPError } from '../ErrorDAO';

type ErrorOS = ObservableSubject<MGPOptional<ErrorDocument>>
export class ErrorDAOMock extends FirestoreDAOMock<MGPError> {

    public static errorDB: MGPMap<string, ErrorOS>;

    public constructor() {
        super('ErrorDAOMock');
    }
    public findErrors(component: string, route: string, message: string, data?: JSONValue): Promise<ErrorDocument[]> {
        if (data === undefined) {
            return this.findWhere([['component', '==', component], ['route', '==', route], ['message', '==', message]]);
        } else {
            return this.findWhere([['component', '==', component], ['route', '==', route], ['message', '==', message], ['data', '==', data]]);
        }
    }
    public getStaticDB(): MGPMap<string, ErrorOS> {
        return ErrorDAOMock.errorDB;
    }
    public resetStaticDB(): void {
        ErrorDAOMock.errorDB = new MGPMap();
    }
}
