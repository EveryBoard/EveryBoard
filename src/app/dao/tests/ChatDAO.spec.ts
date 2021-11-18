import { TestBed } from '@angular/core/testing';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { ChatDAO } from '../ChatDAO';

describe('ChatDAO', () => {

    let dao: ChatDAO;

    beforeEach(async() => {
        await setupEmulators();
        dao = TestBed.inject(ChatDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
});
