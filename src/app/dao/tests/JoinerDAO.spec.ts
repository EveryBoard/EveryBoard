import { TestBed } from '@angular/core/testing';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { JoinerDAO } from '../JoinerDAO';

describe('JoinerDAO', () => {

    let dao: JoinerDAO;

    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(JoinerDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
});
