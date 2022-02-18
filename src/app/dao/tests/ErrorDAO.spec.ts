/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { serverTimestamp } from 'firebase/firestore';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { ErrorDAO, MGPError } from '../ErrorDAO';
import { FirebaseDocument } from '../FirebaseFirestoreDAO';

describe('ErrorDAO', () => {

    let dao: ErrorDAO;

    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(ErrorDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
    describe('findErrors', () => {
        it('should return the empty list if there is no matching error', async() => {
            // Given no matching error
            // When looking for matching errors
            const errors: FirebaseDocument<MGPError>[] = await dao.findErrors('test', '', 'dummy message');
            // Then no matching error should be found
            expect(errors.length).toBe(0);
        });
        it('should find a corresponding error if there is one (with attached data)', async() => {
            // Given an already encountered error
            const error: MGPError = {
                component: 'foo',
                route: '',
                message: 'some error',
                data: { 'foo': 'bar' },
                firstEncounter: serverTimestamp(),
                lastEncounter: serverTimestamp(),
                occurences: 1,
            };
            const errorId: string = await dao.create(error);
            // When looking for matching errors
            const errors: FirebaseDocument<MGPError>[] =
                await dao.findErrors(error.component, error.route, error.message, error.data);
            // Then we should find the matching error
            expect(errors.length).toBe(1);
            expect(errors[0].id).toBe(errorId);
        });
        it('should find a corresponding error if there is one (without attached data)', async() => {
            // Given an already encountered error (without data)
            const error: MGPError = {
                component: 'foo',
                route: '',
                message: 'some error',
                firstEncounter: serverTimestamp(),
                lastEncounter: serverTimestamp(),
                occurences: 1,
            };
            const errorId: string = await dao.create(error);
            // When looking for matching errors (without data)
            const errors: FirebaseDocument<MGPError>[] =
                await dao.findErrors(error.component, error.route, error.message);
            // Then we should find the matching error
            expect(errors.length).toBe(1);
            expect(errors[0].id).toEqual(errorId);
        });
    });
});
