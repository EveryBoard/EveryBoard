import { ChatMessages, ChatService } from '../ChatService';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IChat, IChatId } from 'src/app/domain/ichat';
import { MGPValidation } from 'src/app/utils/MGPValidation';

describe('ChatService', () => {

    let service: ChatService;
    let chatDAO: ChatDAO;

    const EMPTY_CHAT: IChat = {
        messages: [],
    };
    const NON_EMPTY_CHAT: IChat = {
        messages: [{
            content: 'foo',
            sender: 'sender',
            postedTime: 42,
            currentTurn: 2,
        }],
    };

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ChatDAO, useClass: ChatDAOMock },
            ],
        }).compileComponents();

        chatDAO = TestBed.inject(ChatDAO);
        service = new ChatService(chatDAO);
    }));
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    describe('observable', () => {
        it('should follow updates after startObserving is called', fakeAsync(async() => {
            let resolvePromise: (chat: IChatId) => void;
            const promise: Promise<IChatId> = new Promise((resolve: (chat: IChatId) => void) => {
                resolvePromise = resolve;
            });
            const callback: (chat: IChatId) => void = (chat: IChatId) => {
                if (chat.doc.messages.length > 0) {
                    resolvePromise(chat);
                }
            };
            expect(service.isObserving()).toBe(false);
            await chatDAO.set('id', EMPTY_CHAT);
            // given a chat that is observed
            service.startObserving('id', callback);
            expect(service.isObserving()).toBe(true);

            // when the chat is updated
            await chatDAO.set('id', NON_EMPTY_CHAT);

            // then the update has been observed by the callback
            await expectAsync(promise).toBeResolvedTo({ id: 'id', doc: NON_EMPTY_CHAT });
        }));
        it('should throw when observing the same chat twice', fakeAsync(async() => {
            // given a chat that is observed
            await chatDAO.set('id', EMPTY_CHAT);
            service.startObserving('id', (_: IChatId) => { });
            // when trying to observe it again, then an error is thrown
            expect(() => service.startObserving('id', (_: IChatId) => { })).toThrowError(`WTF :: Already observing chat 'id'`);
        }));
        it('should throw when observing a second chat while a first one is already being observed', fakeAsync(async() => {
            await chatDAO.set('id', EMPTY_CHAT);
            // given a chat that is observed
            service.startObserving('id', (_: IChatId) => { });
            // when trying to observe another chat, then an error is thrown
            expect(() => service.startObserving('id2', (_: IChatId) => { })).toThrowError(`Cannot ask to watch 'id2' while watching 'id'`);
        }));
        it('should stop following updates after stopObserving is called', fakeAsync(async() => {
            let resolvePromise: (chat: IChatId) => void;
            const promise: Promise<IChatId> = new Promise((resolve: (chat: IChatId) => void) => {
                resolvePromise = resolve;
            });
            const callback: (chat: IChatId) => void = (chat: IChatId) => {
                if (chat.doc.messages.length > 0) {
                    resolvePromise(chat);
                }
            };
            expect(service.isObserving()).toBe(false);
            await chatDAO.set('id', EMPTY_CHAT);

            // given a chat that is not observed anymore
            service.startObserving('id', callback);
            service.stopObserving();
            expect(service.isObserving()).toBe(false);

            // when the chat is updated
            await chatDAO.set('id', NON_EMPTY_CHAT);

            // then the update is not observed by the callback
            await expectAsync(promise).toBePending();
        }));
        it('should throw when stopObserving is called but no chat is observed', fakeAsync(async() => {
            expect(() => service.stopObserving()).toThrowError('ChatService.stopObserving should not be called if not observing');
        }));
        it('should stop observing upon destroy', fakeAsync(async() => {
            spyOn(service, 'stopObserving');
            await chatDAO.set('id', EMPTY_CHAT);
            // given a chat that we're observing
            service.startObserving('id', (_: IChatId) => { });

            // when the service is destroyed
            service.ngOnDestroy();

            // then it stops observing
            expect(service.stopObserving).toHaveBeenCalledTimes(1);
        }));
    });
    describe('deleteChat', () => {
        it('should delete the chat through the DAO', fakeAsync(async() => {
            spyOn(chatDAO, 'delete');
            // given a chat that exists
            await chatDAO.set('id', EMPTY_CHAT);

            // when calling deleteChat
            await service.deleteChat('id');

            // then the chat has been removed
            expect(chatDAO.delete).toHaveBeenCalledWith('id');
        }));
    });
    describe('createNewChat', () => {
        it('should create the chat through the DAO', fakeAsync(async() => {
            spyOn(chatDAO, 'set');
            // when calling createNewChat
            await service.createNewChat('id');
            // then the chat has been created and is empty
            expect(chatDAO.set).toHaveBeenCalledWith('id', EMPTY_CHAT);
        }));
    });
    describe('sendMessage', () => {
        it('should not send message if no chat is observed', fakeAsync(async() => {
            // given that no chat is observed
            // when sending a message
            const result: Promise<MGPValidation> = service.sendMessage('foo', 'foo', 2);
            // then the message is rejected
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure('Cannot send message if not observing chat'));
        }));
        it('should not send message if the user is not allowed to send a message in the chat', fakeAsync(async() => {
            // given a chat that is observed
            await chatDAO.set('chatId', EMPTY_CHAT);
            service.startObserving('chatId', () => {});
            // when sending a message without a username
            const result: Promise<MGPValidation> = service.sendMessage('', 'foo', 2);
            // then the message is rejected
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure(ChatMessages.CANNOT_SEND_MESSAGE()));
        }));
        it('should not send message if it is empty', fakeAsync(async() => {
            // given a chat that is observed
            await chatDAO.set('chatId', EMPTY_CHAT);
            service.startObserving('chatId', () => {});
            // when sending an empty message
            const result: Promise<MGPValidation> = service.sendMessage('sender', '', 2);
            // then the message is rejected
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure(ChatMessages.FORBIDDEN_MESSAGE()));
        }));
        it('should update the chat with the new message in the DAO', fakeAsync(async() => {
            spyOn(Date, 'now').and.returnValue(42);
            spyOn(chatDAO, 'update');
            // given an empty chat that is observed
            await chatDAO.set('id', EMPTY_CHAT);
            service.startObserving('id', (_: IChatId) => { });

            // when a message is sent on that chat
            await service.sendMessage('sender', 'foo', 2);

            // then the chat should be updated with the new message
            expect(chatDAO.update).toHaveBeenCalledWith('id', NON_EMPTY_CHAT);
        }));
    });
    afterEach(() => {
        service.ngOnDestroy();
    });
});
