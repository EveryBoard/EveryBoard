/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { createConnectedGoogleUser } from 'src/app/services/tests/ConnectedUserService.spec';
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
import { IFirestoreDAO } from '../FirestoreDAO';
import { FirestoreCollectionObserver } from '../FirestoreCollectionObserver';
import { FirebaseError } from 'firebase/app';
import { MinimalUser } from 'src/app/domain/MinimalUser';

async function expectFirestorePermissionDenied<T>(promise: Promise<T>): Promise<void> {
    await promise.then(() => {
        throw new Error('Expected a promise to be rejected but it was resolved');
    },
                       (actualValue: FirebaseError) => expect(actualValue.code).toBe('permission-denied'));
}

describe('ChatDAO', () => {

    let chatDAO: ChatDAO;
    let partDAO: PartDAO;
    let joinerDAO: JoinerDAO;

    function signOut(): Promise<void> {
        return TestBed.inject(FireAuth.Auth).signOut();
    }
    async function createPartAndJoiner(creatorId: string): Promise<string> {
        const id: string = await partDAO.create(PartMocks.INITIAL);
        const creator: MinimalUser = { id: creatorId, name: 'creator' };
        await joinerDAO.set(id, { ...JoinerMocks.INITIAL, creator });
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
            const messagesDAO: IFirestoreDAO<Message> = chatDAO.subCollectionDAO('chatId', 'messages');
            spyOn(messagesDAO, 'observingWhere').and.returnValue(() => { });
            // When calling subscribeToMessages
            const callback: FirestoreCollectionObserver<Message> =
                new FirestoreCollectionObserver<Message>(() => {}, () => {}, () => {});
            chatDAO.subscribeToMessages('chatId', callback);
            // Then it should call observingWhere and sort by postedTime
            expect(messagesDAO.observingWhere).toHaveBeenCalledOnceWith([], callback, 'postedTime');
        });
    });
    describe('on any chat', () => {
        let myUser: MinimalUser;
        let myMessageId: string;
        let otherUser: MinimalUser;
        let otherMessageId: string;
        beforeEach(async() => {
            // Given a user
            const other: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'other-user');
            // and a chat (here the lobby, but this could be any chat)
            await chatDAO.set('lobby', {});
            // with a message from another user
            otherUser = {
                name: 'other-user',
                id: other.uid,
            };
            const message: Message = {
                content: 'hullo there',
                sender: otherUser,
                postedTime: serverTimestamp(),
            };
            otherMessageId = await chatDAO.addMessage('lobby', message);
            await signOut();
            // and a message from the current user, who is able to add messages
            const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'user');
            myUser = {
                name: 'user',
                id: user.uid,
            };
            myMessageId = await chatDAO.addMessage('lobby', { ...message, sender: myUser });
        });
        it('should forbid disconnected users to read a chat', async() => {
            // Given a disconnected user
            await signOut();
            // When trying to read a chat
            const chatRead: Promise<MGPOptional<Chat>> = chatDAO.read('lobby');
            // Then it fails
            await expectFirestorePermissionDenied(chatRead);
        });
        it('should forbid a user to post a message as another user', async() => {
            // When posting a message as another user
            const message: Message = {
                content: 'hello',
                sender: otherUser,
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage('lobby', message);
            // Then it fails
            await expectFirestorePermissionDenied(result);
        });
        it('should forbid a user to post a message with the wrong username', async() => {
            // When posting a message with a different username
            const message: Message = {
                content: 'hello',
                sender: { id: myUser.id, name: 'not-my-username!' },
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage('lobby', message);
            // Then it fails
            await expectFirestorePermissionDenied(result);
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
            await expectFirestorePermissionDenied(result);
        });
        it('should forbid a user to change a message of another user', async() => {
            // When updating the message of another user
            const result: Promise<void> = chatDAO.subCollectionDAO('lobby', 'messages').update(otherMessageId, { content: 'hullo' });
            // Then it fails
            await expectFirestorePermissionDenied(result);
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
            await expectFirestorePermissionDenied(chatCreation);
        });
        it('should allow a verified user to post a message on the lobby chat', async() => {
            // Given a verified user
            const user: FireAuth.User = await createConnectedGoogleUser(true, 'foo@bar.com', 'myself');
            const myUser: MinimalUser = {
                name: 'myself',
                id: user.uid,
            };
            // When posting in the lobby chat
            const message: Message = {
                content: 'hello',
                sender: myUser,
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
            const someUser: MinimalUser = {
                name: 'someone',
                id: 'some-id',
            };
            const message: Message = {
                content: 'hello',
                sender: someUser,
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage('lobby', message);
            // Then it fails
            await expectFirestorePermissionDenied(result);
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
            await expectFirestorePermissionDenied(result);
        });
        it('should forbid a non-part owner to create the corresponding chat', async() => {
            // Given a verified user who is not a part owner, and a part
            await createConnectedGoogleUser(true);
            const partId: string = await createPartAndJoiner('not-me');
            // When creating a part chat
            const result: Promise<void> = chatDAO.set(partId, {});
            // Then it should fail
            await expectFirestorePermissionDenied(result);
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
            await expectFirestorePermissionDenied(result);
        });
    });
});
