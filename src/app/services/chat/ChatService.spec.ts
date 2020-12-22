import {ChatService} from './ChatService';
import {ChatDAO} from 'src/app/dao/chat/ChatDAO';
import {INCLUDE_VERBOSE_LINE_IN_TEST} from 'src/app/app.module';
import {ChatDAOMock} from 'src/app/dao/chat/ChatDAOMock';

describe('ChatService', () => {
    let service: ChatService;

    beforeAll(() => {
        ChatService.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || ChatService.VERBOSE;
    });
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
