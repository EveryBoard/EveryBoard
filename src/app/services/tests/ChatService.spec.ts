/* eslint-disable max-lines-per-function */
import { ChatMessages, ChatService } from '../ChatService';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Message } from 'src/app/domain/Message';
import { serverTimestamp } from 'firebase/firestore';
import { MinimalUser } from 'src/app/domain/MinimalUser';

describe('ChatService', () => {

    let chatService: ChatService;
    let chatDAO: ChatDAO;

    const MESSAGE: Message = {
        content: 'foo',
        sender: { name: 'sender', id: 'senderId' },
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
        chatService = new ChatService(chatDAO);
    }));
    it('should be created', () => {
        expect(chatService).toBeTruthy();
    });
    describe('deleteChat', () => {
        it('should delete the chat through the DAO', fakeAsync(async() => {
            spyOn(chatDAO, 'delete').and.callThrough();
            // given a chat that exists
            await chatService.createNewChat('id');

            // when calling deleteChat
            await chatService.deleteChat('id');

            // then the chat has been removed
            expect(chatDAO.delete).toHaveBeenCalledWith('id');
        }));
    });
    describe('createNewChat', () => {
        it('should create the chat through the DAO', fakeAsync(async() => {
            spyOn(chatDAO, 'set').and.callThrough();
            // when calling createNewChat
            await chatService.createNewChat('id');
            // then the chat has been initialized with the DAO
            expect(chatDAO.set).toHaveBeenCalledWith('id', {});
        }));
    });
    describe('sendMessage', () => {
        it('should not send message if the user is not allowed to send a message in the chat', fakeAsync(async() => {
            // given a chat
            await chatService.createNewChat('id');
            // when sending a message without a username
            const sender: MinimalUser = { name: '', id: 'fooId' };
            const result: Promise<MGPValidation> = chatService.sendMessage('id', sender, 'foo', 2);
            // then the message is rejected
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure(ChatMessages.CANNOT_SEND_MESSAGE()));
        }));
        it('should not send message if it is empty', fakeAsync(async() => {
            // given a chat
            await chatService.createNewChat('id');
            // when sending an empty message
            const sender: MinimalUser = { name: 'sender', id: 'senderId' };
            const result: Promise<MGPValidation> = chatService.sendMessage('id', sender, '', 2);
            // then the message is rejected
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure(ChatMessages.FORBIDDEN_MESSAGE()));
        }));
        it('should update the chat with the new message in the DAO', fakeAsync(async() => {
            spyOn(Date, 'now').and.returnValue(42);
            spyOn(chatService, 'addMessage').and.callThrough();
            // given an empty chat
            await chatService.createNewChat('id');

            // when a message is sent on that chat
            const sender: MinimalUser = { name: 'sender', id: 'senderId' };
            await chatService.sendMessage('id', sender, 'foo', 2);

            // then the chat should be updated with the new message
            expect(chatService.addMessage).toHaveBeenCalledWith('id', MESSAGE);
        }));
    });
});
