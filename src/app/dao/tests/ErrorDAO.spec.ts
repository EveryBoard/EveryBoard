/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { ErrorDAO } from '../ErrorDAO';

describe('ErrorDAO', () => {

    let errorDAO: ErrorDAO;

    beforeEach(async() => {
        await setupEmulators();
        errorDAO = TestBed.inject(ErrorDAO);
    });
    it('should be created', () => {
        expect(errorDAO).toBeTruthy();
    });
});
