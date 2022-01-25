/* eslint-disable max-lines-per-function */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FirebaseDocument } from 'src/app/dao/FirebaseFirestoreDAO';
import { FirebaseFirestoreDAOMock } from 'src/app/dao/tests/FirebaseFirestoreDAOMock.spec';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ObservableSubject } from 'src/app/utils/tests/ObservableSubject.spec';
import { BlankComponent, setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { JSONValue } from 'src/app/utils/utils';
import { EncounteredError, ErrorDAO, ErrorLoggerService } from '../ErrorLoggerService';
import firebase from 'firebase/app';
import { RouterTestingModule } from '@angular/router/testing';

type ErrorOS = ObservableSubject<MGPOptional<FirebaseDocument<EncounteredError>>>
class ErrorDAOMock extends FirebaseFirestoreDAOMock<EncounteredError> {

    public static errorDB: MGPMap<string, ErrorOS>;

    public constructor() {
        super('ErrorDAOMock', false);
    }
    public getStaticDB(): MGPMap<string, ErrorOS> {
        return ErrorDAOMock.errorDB;
    }
    public resetStaticDB(): void {
        ErrorDAOMock.errorDB = new MGPMap();
    }
}

describe('ErrorDAO', () => {

    let dao: ErrorDAO;

    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(ErrorDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
});

describe('ErrorLoggerService', () => {

    let service: ErrorLoggerService;
    let errorDAO: ErrorDAO;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: '**', component: BlankComponent },
                ]),
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ErrorDAO, useClass: ErrorDAOMock },
            ],
        }).compileComponents();
        service = TestBed.inject(ErrorLoggerService);
        errorDAO = TestBed.inject(ErrorDAO);
    }));
    it('should create', fakeAsync(async() => {
        expect(service).toBeTruthy();
    }));
    it('should add new errors to the DB', fakeAsync(async() => {
        // Given an error in a component which has not already been encountered
        const component: string = 'Some component';
        const message: string = 'my new error message';
        const data: JSONValue = { foo: 'bar' };
        spyOn(errorDAO, 'create');

        // When logging it
        ErrorLoggerService.logError(component, message, data);
        tick(1000);

        // Then the error is stored in the DAO with all expected fields
        const expectedError: EncounteredError = {
            component,
            route: '/',
            message,
            data,
            firstEncounter: firebase.firestore.FieldValue.serverTimestamp(),
            lastEncounter: firebase.firestore.FieldValue.serverTimestamp(),
            occurences: 1,
        };
        expect(errorDAO.create).toHaveBeenCalledOnceWith(expectedError);
    }));
    it('should increment count of already encountered errors', fakeAsync(async() => {
        spyOn(errorDAO, 'update');
        // Given an error in a component which has already been encountered
        const component: string = 'Some component';
        const message: string = 'my new error message';
        const data: JSONValue = { foo: 'bar' };
        ErrorLoggerService.logError(component, message, data);
        tick(1000);
        const errors: FirebaseDocument<EncounteredError>[] = await errorDAO.findWhere([['component', '==', component], ['route', '==', '/'], ['message', '==', message], ['data', '==', data]]);
        expect(errors.length).toBe(1);
        const id: string = errors[0].id;


        // When logging it a second time
        ErrorLoggerService.logError(component, message, data);
        tick(1000);

        // Then the error is updated in the DAO with all expected fields
        const update: Partial<EncounteredError> = {
            lastEncounter: firebase.firestore.FieldValue.serverTimestamp(),
            occurences: 2,
        };
        expect(errorDAO.update).toHaveBeenCalledOnceWith(id, update);
    }));
});
