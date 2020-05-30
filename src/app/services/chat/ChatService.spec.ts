import { async } from '@angular/core/testing';
import { ChatService } from './ChatService';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

const chatDaoStub = {
};
describe('ChatService', () => {

    let service: ChatService;

    beforeAll(() => {
        ChatService.IN_TESTING = true;
        ChatService.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
    });
    beforeEach(() => {
        service = new ChatService(chatDaoStub as ChatDAO);
    });
    it('should create', async(() => {
        expect(service).toBeTruthy();
    }));
    afterAll(async(() => {
        service.ngOnDestroy();
        ChatService.IN_TESTING = false;
    }));
});