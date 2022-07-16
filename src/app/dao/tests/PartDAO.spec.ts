/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { PartDAO } from '../PartDAO';

describe('PartDAO', () => {

    let dao: PartDAO;

    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(PartDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
});
