import { FirestoreDAOMock } from 'src/app/dao/tests/FirestoreDAOMock.spec';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { JSONValue } from 'src/app/utils/utils';
import { ErrorDocument, MGPError } from '../ErrorDAO';

type ErrorOS = ObservableSubject<MGPOptional<ErrorDocument>>
export class ErrorDAOMock extends FirestoreDAOMock<MGPError> {

    public static errorDB: MGPMap<string, ErrorOS>;

    public constructor() {
        super('ErrorDAOMock', false);
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
