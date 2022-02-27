/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { createConnectedGoogleUser } from 'src/app/services/tests/AuthenticationService.spec';
import { setupEmulators } from 'src/app/utils/tests/TestUtils.spec';
import { ChatDAO } from '../ChatDAO';
import * as FireAuth from '@angular/fire/auth';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Chat } from 'src/app/domain/Chat';
import { serverTimestamp } from 'firebase/firestore';
import { Message, MessageDocument } from 'src/app/domain/Message';
import { PartDAO } from '../PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { JoinerDAO } from '../JoinerDAO';
import { IFirebaseFirestoreDAO } from '../FirebaseFirestoreDAO';
import { FirebaseCollectionObserver } from '../FirebaseCollectionObserver';

describe('ChatDAO', () => {

    let chatDAO: ChatDAO;
    let partDAO: PartDAO;
    let joinerDAO: JoinerDAO;

    function signOut(): Promise<void> {
        return TestBed.inject(FireAuth.Auth).signOut();
    }
    async function createPartAndJoiner(creatorId: string): Promise<string> {
        const id: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(id, { ...JoinerMocks.INITIAL, creatorId });
        return id;
    }
    beforeEach(async() => {
        await setupEmulators();
        chatDAO = TestBed.inject(ChatDAO);
        partDAO = TestBed.inject(PartDAO);
        joinerDAO = TestBed.inject(JoinerDAO);
    });
    it('should be created', () => {
        expect(chatDAO).toBeTruthy();
    });
    describe('subscribeToMessages', () => {
        it('should rely on observingWhere of messages DAO and sort by postedTime', () => {
            // Given a chat DAO
            const messagesDAO: IFirebaseFirestoreDAO<Message> = chatDAO.subCollectionDAO('chatId', 'messages');
            spyOn(messagesDAO, 'observingWhere');
            // When calling subscribeToMessages
            const callback: FirebaseCollectionObserver<Message> = new FirebaseCollectionObserver<Message>();
            chatDAO.subscribeToMessages('chatId', callback);
            // Then it should call observingWhere and sort by postedTime
            expect(messagesDAO.observingWhere).toHaveBeenCalledOnceWith([], callback, 'postedTime');
        });
    });
    describe('on any chat', () => {
        let myUserId: string;
        let myMessageId: string;
        let otherUserId: string;
        let otherMessageId: string;
        beforeEach(async() => {
            // Given a user
            const otherUser: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'other-user');
            // and a chat (here the lobby, but this could be any chat)
            await chatDAO.set('lobby', {});
            // with a message from another user
            otherUserId = otherUser.uid;
            const message: Message = {
                content: 'hullo there',
                senderId: otherUserId,
                sender: 'other-user',
                postedTime: serverTimestamp(),
            };
            otherMessageId = await chatDAO.addMessage('lobby', message);
            await signOut();
            // and a message from the current user, who is able to add messages
            const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'user');
            myUserId = user.uid;
            myMessageId = await chatDAO.addMessage('lobby', { ...message, senderId: myUserId, sender: 'user' });
        });
        it('should forbid disconnected users to read a chat', async() => {
            // Given a disconnected user
            await signOut();
            // When trying to read a chat
            const chatRead: Promise<MGPOptional<Chat>> = chatDAO.read('lobby');
            // Then it fails
            await expectAsync(chatRead).toBeRejected();
        });
        it('should forbid a user to post a message as another user', async() => {
            // When posting a message as another user
            const message: Message = {
                content: 'hello',
                senderId: 'some-other-user-id',
                sender: 'someone',
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage('lobby', message);
            // Then it fails
            await expectAsync(result).toBeRejected();
        });
        it('should forbid a user to post a message with the wrong username', async() => {
            // When posting a message with a different username
            const message: Message = {
                content: 'hello',
                senderId: myUserId,
                sender: 'not-my-username!',
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage('lobby', message);
            // Then it fails
            await expectAsync(result).toBeRejected();
        });
        it('should allow users to delete one of its messages', async() => {
            // When deleting one of the current user's message
            const result: Promise<void> = chatDAO.subCollectionDAO('lobby', 'messages').delete(myMessageId);
            // Then it succeeds and the message is removed
            await expectAsync(result).toBeResolvedTo();
            const allMessages: MessageDocument[] = await chatDAO.getLastMessages('lobby', 5);
            expect(allMessages.length).toBe(1); // Only 1 of the original message remains
        });
        it('should forbid a user to delete a message of another user', async() => {
            // When deleting the message of another user
            const result: Promise<void> = chatDAO.subCollectionDAO('lobby', 'messages').delete(otherMessageId);
            // Then it fails
            await expectAsync(result).toBeResolvedTo();
        });
        it('should allow a user to change one of its messages', async() => {
            // When updating one of the current user's message
            const result: Promise<void> = chatDAO.subCollectionDAO('lobby', 'messages').update(myMessageId, { content: 'hullo' });
            // Then it succeeds and the message is updated
            await expectAsync(result).toBeResolvedTo();
            const message: MGPOptional<Message> = await chatDAO.subCollectionDAO<Message>('lobby', 'messages').read(myMessageId);
            expect(message.get().content).toBe('hullo');
        });
        it('should forbid a user to change the sender of a message', async() => {
            // When updating one of the current user's message and changing its sender
            const result: Promise<void> = chatDAO.subCollectionDAO('lobby', 'messages').update(myMessageId, { sender: 'bli' });
            // Then it fails
            await expectAsync(result).toBeRejected();
        });
        it('should forbid a user to change a message of another user', async() => {
            // When updating the message of another user
            const result: Promise<void> = chatDAO.subCollectionDAO('lobby', 'messages').update(otherMessageId, { content: 'hullo' });
            // Then it fails
            await expectAsync(result).toBeRejected();
        });
    });
    describe('on the lobby chat', () => {
        it('should allow a verified user to create the lobby chat', async() => {
            // Given a verified user
            await createConnectedGoogleUser(true);
            // When creating the 'lobby' chat
            const chatCreation: Promise<void> = chatDAO.set('lobby', {});
            // Then it succeeds
            await expectAsync(chatCreation).toBeResolvedTo();
            await signOut();
        });
        it('should forbid a disconnected user to create the lobby chat', async() => {
            // Given a disconnected user
            await signOut();
            // When creating the 'lobby' chat
            const chatCreation: Promise<void> = chatDAO.set('lobby', {});
            // Then it fails
            await expectAsync(chatCreation).toBeRejected();
        });
        it('should allow a verified user to post a message on the lobby chat', async() => {
            // Given a verified user
            const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'myself');
            const userId: string = user.uid;
            // When posting in the lobby chat
            const message: Message = {
                content: 'hello',
                sender: 'myself',
                senderId: userId,
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage('lobby', message);
            // Then it succeeds and the message has been added to the chat
            await expectAsync(result).toBeResolved();
            const allMessages: MessageDocument[] = await chatDAO.getLastMessages('lobby', 5);
            expect(allMessages.length).toBe(1);
            await signOut();
        });
        it('should forbid a disconnected user to post a message on the lobby chat', async() => {
            // Given a disconnected user
            // When posting in the lobby chat
            const message: Message = {
                content: 'hello',
                sender: 'someone',
                senderId: 'some-id',
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage('lobby', message);
            // Then it fails
            await expectAsync(result).toBeRejected();
        });
    });
    describe('on a part chat', () => {
        it('should allow a part owner to create the corresponding chat', async() => {
            // Given a verified user who is a part owner
            const user: FireAuth.User = await createConnectedGoogleUser(true);
            const userId: string = user.uid;
            const partId: string = await createPartAndJoiner(userId);
            // When creating the corresponding chat
            const result: Promise<void> = chatDAO.set(partId, {});
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should allow a part owner to delete the corresponding chat', async() => {
            // Given a verified user who is a part owner, and a chat
            const user: FireAuth.User = await createConnectedGoogleUser(true);
            const userId: string = user.uid;
            const partId: string = await createPartAndJoiner(userId);
            await chatDAO.set(partId, {});
            // When deleting the chat
            const result: Promise<void> = chatDAO.delete(partId);
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid creating a chat if there is no corresponding part', async() => {
            // Given a verified user and no corresponding part
            await createConnectedGoogleUser(true);
            // When creating a part chat
            const result: Promise<void> = chatDAO.set('unexisting-part-id', {});
            // Then it should fail
            await expectAsync(result).toBeRejected();
        });
        it('should forbid a non-part owner to create the corresponding chat', async() => {
            // Given a verified user who is not a part owner, and a part
            await createConnectedGoogleUser(true);
            const partId: string = await createPartAndJoiner('not-me');
            // When creating a part chat
            const result: Promise<void> = chatDAO.set(partId, {});
            // Then it should fail
            await expectAsync(result).toBeRejected();
        });
        it('should forbid a non-part owner to delete the corresponding chat', async() => {
            // Given a part, a chat, and a non-part owner user
            const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com');
            const userId: string = user.uid;
            const partId: string = await createPartAndJoiner(userId);
            await chatDAO.set(partId, {});
            await signOut();
            await createConnectedGoogleUser(true, 'bar@bar.com');
            // When deleting the chat
            const result: Promise<void> = chatDAO.delete(partId);
            // Then it should fail
            await expectAsync(result).toBeRejected();
        });
    });
});
