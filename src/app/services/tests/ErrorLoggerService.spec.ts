/* eslint-disable max-lines-per-function */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FirestoreDocument } from 'src/app/dao/FirestoreDAO';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { JSONValue } from 'src/app/utils/utils';
import { ErrorLoggerService } from '../ErrorLoggerService';
import { RouterTestingModule } from '@angular/router/testing';
import { serverTimestamp } from 'firebase/firestore';
import { ErrorDAO, MGPError } from 'src/app/dao/ErrorDAO';
import { ErrorDAOMock } from 'src/app/dao/tests/ErrorDAOMock.spec';

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
    it('should throw instead of logging the error when not initialized', () => {
        // Given a non-initialized error logger service
        // eslint-disable-next-line dot-notation
        ErrorLoggerService['singleton'] = MGPOptional.empty();
        // When logging an error
        // Then it throws instead
        expect(() => ErrorLoggerService.logError('component', 'error')).toThrowError('component: error (extra data: undefined)');
    });
    it('should add new error to the DB', fakeAsync(async() => {
        // Given an error in a component which has not already been encountered
        const component: string = 'Some component';
        const message: string = 'my new error message';
        const data: JSONValue = { foo: 'bar' };
        spyOn(errorDAO, 'create');

        // When logging it
        ErrorLoggerService.logError(component, message, data);
        tick(1000);

        // Then the error is stored in the DAO with all expected fields
        const expectedError: MGPError = {
            component,
            route: '/',
            message,
            data,
            firstEncounter: serverTimestamp(),
            lastEncounter: serverTimestamp(),
            occurences: 1,
        };
        expect(errorDAO.create).toHaveBeenCalledOnceWith(expectedError);
    }));
    it('should not include data field of an error if it is not provided', fakeAsync(async() => {
        // Given an error in a component which has not already been encountered
        const component: string = 'Some component';
        const message: string = 'my new error message';
        spyOn(errorDAO, 'create');

        // When logging it
        ErrorLoggerService.logError(component, message);
        tick(1000);

        // Then the error is stored in the DAO with all expected fields
        const expectedError: MGPError = {
            component,
            route: '/',
            message,
            firstEncounter: serverTimestamp(),
            lastEncounter: serverTimestamp(),
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
        const errors: FirestoreDocument<MGPError>[] = await errorDAO.findErrors(component, '/', message, data);
        expect(errors.length).toBe(1);
        const id: string = errors[0].id;

        // When logging it a second time
        ErrorLoggerService.logError(component, message, data);
        tick(1000);

        // Then the error is updated in the DAO with all expected fields
        const update: Partial<MGPError> = {
            lastEncounter: serverTimestamp(),
            occurences: 2,
        };
        expect(errorDAO.update).toHaveBeenCalledOnceWith(id, update);
    }));
});
