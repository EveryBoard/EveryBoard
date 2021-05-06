import { ChatService } from './ChatService';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';

describe('ChatService', () => {
    let service: ChatService;

    beforeEach(() => {
        service = new ChatService(new ChatDAOMock() as unknown as ChatDAO);
    });
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    afterAll(() => {
        service.ngOnDestroy();
    });
});
