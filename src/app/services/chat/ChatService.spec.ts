import { ChatService } from './ChatService';
import { ChatDAO } from 'src/app/dao/chat/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/chat/ChatDAOMock';

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
