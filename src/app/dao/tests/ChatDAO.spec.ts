import { TestBed } from '@angular/core/testing';
import { ChatDAO } from '../ChatDAO';
import { setupFirestoreTestModule } from './FirebaseFirestoreDAO.spec';

describe('ChatDAO', () => {
    let dao: ChatDAO;
    beforeEach(async() => {
        await setupFirestoreTestModule();
        dao = TestBed.inject(ChatDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
});
