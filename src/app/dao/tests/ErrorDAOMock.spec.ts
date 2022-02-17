import { FirebaseFirestoreDAOMock } from 'src/app/dao/tests/FirebaseFirestoreDAOMock.spec';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { JSONValue } from 'src/app/utils/utils';
import { MGPError } from '../ErrorDAO';
import { FirebaseDocument } from '../FirebaseFirestoreDAO';

type ErrorOS = ObservableSubject<MGPOptional<FirebaseDocument<MGPError>>>
export class ErrorDAOMock extends FirebaseFirestoreDAOMock<MGPError> {

    public static errorDB: MGPMap<string, ErrorOS>;

    public constructor() {
        super('ErrorDAOMock', false);
    }
    public findErrors(component: string, route: string, message: string, data?: JSONValue)
    : Promise<FirebaseDocument<MGPError>[]>
    {
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
