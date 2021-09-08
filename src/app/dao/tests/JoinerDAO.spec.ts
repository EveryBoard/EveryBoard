import { TestBed } from '@angular/core/testing';
import { JoinerDAO } from '../JoinerDAO';
import { setupFirestoreTestModule } from './FirebaseFirestoreDAO.spec';

describe('JoinerDAO', () => {
    let dao: JoinerDAO;
    beforeEach(async() => {
        await setupFirestoreTestModule();
        dao = TestBed.inject(JoinerDAO);
    });
    it('should be created', () => {
        expect(dao).toBeTruthy();
    });
});
