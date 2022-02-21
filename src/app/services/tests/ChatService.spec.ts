/* eslint-disable max-lines-per-function */
import { ChatMessages, ChatService } from '../ChatService';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Message, MessageDocument } from 'src/app/domain/Message';
import { serverTimestamp } from 'firebase/firestore';
import { ErrorLoggerService } from '../ErrorLoggerService';
import { ErrorLoggerServiceMock } from './ErrorLoggerServiceMock.spec';
import { JSONValue } from 'src/app/utils/utils';
import { FirebaseCollectionObserver } from 'src/app/dao/FirebaseCollectionObserver';

describe('ChatService', () => {

    let service: ChatService;
    let chatDAO: ChatDAO;

    const MESSAGE: Message = {
        content: 'foo',
        senderId: 'senderId',
        sender: 'sender',
        postedTime: serverTimestamp(),
        currentTurn: 2,
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
            let resolvePromise: (messageIds: string[]) => void;
            const promise: Promise<string[]> = new Promise((resolve: (messageIds: string[]) => void) => {
                resolvePromise = resolve;
            });
            const callback: (chat: MessageDocument[]) => void = (messages: MessageDocument[]) => {
                if (messages.length > 0) {
                    resolvePromise(messages.map((doc: MessageDocument) => doc.id));
                }
            };
            expect(service.isObserving()).toBe(false);
            await service.createNewChat('id');
            // given a chat that is observed
            service.startObserving('id', new FirebaseCollectionObserver<Message>(callback, () => { }, () => { }));
            expect(service.isObserving()).toBe(true);

            // when the chat is updated
            const messageId: string = await chatDAO.addMessage('id', MESSAGE);

            // then the update has been observed by the callback
            const messageIds: string[] = await promise;
            expect(messageIds).toEqual([messageId]);
        }));
        it('should log error when observing the same chat twice', fakeAsync(async() => {
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            // Given a chat that is observed
            await service.createNewChat('id');
            service.startObserving('id', new FirebaseCollectionObserver<Message>(() => { }, () => { }, () => { }));
            // When trying to observe it again
            service.startObserving('id', new FirebaseCollectionObserver<Message>(() => { }, () => { }, () => { }));
            // Then it logged an error
            const errorMessage: string = 'Already observing same chat';
            const errorData: JSONValue = { chatId: 'id' };
            expect(ErrorLoggerService.logError).toHaveBeenCalledWith('ChatService', errorMessage, errorData);
        }));
        it('should throw when observing a second chat while a first one is already being observed', fakeAsync(async() => {
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            // Given a chat that is observed
            await service.createNewChat('id');
            service.startObserving('id', new FirebaseCollectionObserver<Message>(() => { }, () => { }, () => { }));
            // When trying to observe another chat, then an error is thrown
            service.startObserving('id2', new FirebaseCollectionObserver<Message>(() => { }, () => { }, () => { }));
            // Then it logged an error
            const errorMessage: string = 'Already observing another chat';
            const errorData: JSONValue = { chatId: 'id2', followedChatId: 'id' };
            expect(ErrorLoggerService.logError).toHaveBeenCalledWith('ChatService', errorMessage, errorData);
        }));
        it('should stop following updates after stopObserving is called', fakeAsync(async() => {
            let resolvePromise: (messages: Message[]) => void;
            const promise: Promise<Message[]> = new Promise((resolve: (messages: Message[]) => void) => {
                resolvePromise = resolve;
            });
            const callback: (messages: MessageDocument[]) => void = (messages: MessageDocument[]) => {
                if (messages.length > 0) {
                    resolvePromise(messages.map((doc: MessageDocument) => doc.data));
                }
            };
            expect(service.isObserving()).toBe(false);
            await service.createNewChat('id');

            // given a chat that is not observed anymore
            service.startObserving('id', new FirebaseCollectionObserver<Message>(callback, () => { }, () => { }));
            service.stopObserving();
            expect(service.isObserving()).toBe(false);

            // when the chat is updated
            await chatDAO.addMessage('id', MESSAGE);

            // then the update is not observed by the callback
            await expectAsync(promise).toBePending();
        }));
        it('should throw when stopObserving is called but no chat is observed', fakeAsync(async() => {
            expect(() => service.stopObserving()).toThrowError('ChatService.stopObserving should not be called if not observing');
        }));
        it('should stop observing upon destroy', fakeAsync(async() => {
            spyOn(service, 'stopObserving');
            // given a chat that we're observing
            await service.createNewChat('id');
            service.startObserving('id', new FirebaseCollectionObserver<Message>(() => { }, () => { }, () => { }));

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
            await service.createNewChat('id');

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
            // then the chat has been initialized with the DAO
            expect(chatDAO.set).toHaveBeenCalledWith('id', {});
        }));
    });
    describe('sendMessage', () => {
        it('should not send message if no chat is observed', fakeAsync(async() => {
            // given that no chat is observed
            // when sending a message
            const result: Promise<MGPValidation> = service.sendMessage('fooId', 'foo', 'foo', 2);
            // then the message is rejected
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure('Cannot send message if not observing chat'));
        }));
        it('should not send message if the user is not allowed to send a message in the chat', fakeAsync(async() => {
            // given a chat that is observed
            await service.createNewChat('id');
            service.startObserving('id', new FirebaseCollectionObserver<Message>(() => { }, () => { }, () => { }));
            // when sending a message without a username
            const result: Promise<MGPValidation> = service.sendMessage('fooId', '', 'foo', 2);
            // then the message is rejected
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure(ChatMessages.CANNOT_SEND_MESSAGE()));
        }));
        it('should not send message if it is empty', fakeAsync(async() => {
            // given a chat that is observed
            await service.createNewChat('id');
            service.startObserving('id', new FirebaseCollectionObserver<Message>(() => { }, () => { }, () => { }));
            // when sending an empty message
            const result: Promise<MGPValidation> = service.sendMessage('senderId', 'sender', '', 2);
            // then the message is rejected
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure(ChatMessages.FORBIDDEN_MESSAGE()));
        }));
        it('should update the chat with the new message in the DAO', fakeAsync(async() => {
            spyOn(Date, 'now').and.returnValue(42);
            spyOn(chatDAO, 'addMessage');
            // given an empty chat that is observed
            await service.createNewChat('id');
            service.startObserving('id', new FirebaseCollectionObserver<Message>(() => { }, () => { }, () => { }));

            // when a message is sent on that chat
            await service.sendMessage('senderId', 'sender', 'foo', 2);

            // then the chat should be updated with the new message
            expect(chatDAO.addMessage).toHaveBeenCalledWith('id', MESSAGE);
        }));
    });
    afterEach(() => {
        service.ngOnDestroy();
    });
});
