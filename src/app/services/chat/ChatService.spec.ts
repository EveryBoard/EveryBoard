import { async } from '@angular/core/testing';
import { ChatService } from './ChatService';
import { ChatDAO } from 'src/app/dao/ChatDAO';

const chatDaoStub = {
};
describe('ChatService', () => {

    let service: ChatService;

    beforeEach(() => {
        service = new ChatService(chatDaoStub as ChatDAO);
    });
    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));
    afterAll(async(() => {
        service.ngOnDestroy();
    }));
});