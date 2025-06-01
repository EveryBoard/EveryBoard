/* eslint-disable max-lines-per-function */
/*import { ChatMessages, ChatService } from '../ChatService';
import { fakeAsync } from '@angular/core/testing';
import { MGPValidation } from '@everyboard/lib';
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
        chatService = new ChatService(chatDAO);
    }));
    it('should be created', () => {
        expect(chatService).toBeTruthy();
    });
    describe('sendMessage', () => {
        it('should not send message if the user is not allowed to send a message in the chat', fakeAsync(async() => {
            // Given a chat
            await chatDAO.set('id', {});
            // When sending a message without a username
            const sender: MinimalUser = { name: '', id: 'fooId' };
            const result: Promise<MGPValidation> = chatService.sendMessage('id', sender, 'foo', 2);
            // Then the message is rejected
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure(ChatMessages.CANNOT_SEND_MESSAGE()));
        }));
        it('should not send message if it is empty', fakeAsync(async() => {
            // Given a chat
            await chatDAO.set('id', {});

            // When sending an empty message
            const sender: MinimalUser = { name: 'sender', id: 'senderId' };
            const result: Promise<MGPValidation> = chatService.sendMessage('id', sender, '', 2);

            // Then the message is rejected
            await expectAsync(result).toBeResolvedTo(MGPValidation.failure(ChatMessages.FORBIDDEN_MESSAGE()));
        }));
        it('should update the chat with the new message in the DAO', fakeAsync(async() => {
            spyOn(Date, 'now').and.returnValue(42);
            spyOn(chatService, 'addMessage').and.callThrough();
            // Given an empty chat
            await chatDAO.set('id', {});

            // When a message is sent on that chat
            const sender: MinimalUser = { name: 'sender', id: 'senderId' };
            await chatService.sendMessage('id', sender, 'foo', 2);

            // Then the chat should be updated with the new message
            expect(chatService.addMessage).toHaveBeenCalledWith('id', MESSAGE);
        }));
    });
});
*/
