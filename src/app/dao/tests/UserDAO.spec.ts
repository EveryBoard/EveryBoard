/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { UserDAO } from '../UserDAO';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';

describe('UserDAO', () => {

    let dao: UserDAO;

    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(UserDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
});
