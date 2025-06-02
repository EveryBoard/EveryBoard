/* eslint-disable max-lines-per-function */
import { fakeAsync, tick } from '@angular/core/testing';

import { Message } from 'src/app/domain/Message';
import { ChatService } from '../ChatService';
import { AbstractBackendService, BackendService } from '../BackendService';
import { BackendServiceMock } from './BackendServiceMock.spec';

describe('ChatService', () => {

    let chatService: ChatService;
    let backendService: BackendServiceMock;

    const message: Message = {
        content: 'foo',
        sender: { name: 'sender', id: 'senderId' },
        timestamp: 0,
    };

    beforeEach(fakeAsync(async() => {
        backendService = new BackendServiceMock();
        chatService = new ChatService(backendService as AbstractBackendService as BackendService);
    }));

    it('should be created', () => {
        expect(chatService).toBeTruthy();
    });

    describe('sendMessage', () => {
        it('should send the message to the backend', fakeAsync(async() => {
            spyOn(backendService, 'send').and.callThrough();
            // Given a chat
            // When sending a message
            await chatService.addMessage('hello');
            // Then the message is forwarded to the backend
            expect(backendService.send).toHaveBeenCalledOnceWith(['ChatSend', { message: 'hello' }]);
        }));
    });

    describe('subscribeToMessage', () => {
        it('should receive messages from the backend', fakeAsync(async() => {
            // Given a chat where we subscribed to the messages
            const receivedMessages: Message[] = [];
            chatService.subscribeToMessages((m: Message): void => {
                receivedMessages.push(m);
            });
            // When a message is received by the backend
            backendService.mockReceivedMessage('ChatMessage', { message: message });
            tick(1);
            // Then we receive it too
            expect(receivedMessages.length).toBe(1);
        }));
    });

});
