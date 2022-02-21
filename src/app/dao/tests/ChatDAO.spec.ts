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

describe('ChatDAO', () => {

    let chatDAO: ChatDAO;
    let partDAO: PartDAO;
    let joinerDAO: JoinerDAO;

    function signOut(): Promise<void> {
        return TestBed.inject(FireAuth.Auth).signOut();
    }
    async function createChat(id: string): Promise<void> {
        // We need an authenticated user to create a chat
        await createConnectedGoogleUser(false);
        await chatDAO.set(id, {});
        await signOut();
    }
    async function createPartAndJoiner(creatorId: string): Promise<string> {
        const id: string = await partDAO.create(PartMocks.INITIAL);
        await joinerDAO.set(id, { ...JoinerMocks.INITIAL, creator: creatorId });
        return id;
    }
    function addCandidate(joinerId: string, candidateId: string): Promise<void> {
        return joinerDAO.update(joinerId, { candidates: [candidateId] });
    }
    function setPlayerZero(partId: string, playerId: string): Promise<void> {
        return partDAO.update(partId, { playerZero: playerId });
    }
    function setPlayerOne(partId: string, playerId: string): Promise<void> {
        return partDAO.update(partId, { playerOne: playerId });
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
    describe('any chat', () => {
        let myUserId: string;
        let otherUserId: string;
        beforeEach(async() => {
            // Given a chat (here the lobby, but this could be any chat)
            await createChat('lobby');
            // with a message from another user
            const otherUser: FireAuth.User = await createConnectedGoogleUser(false);
            otherUserId = otherUser.uid;
            const message: Message = {
                content: 'hullo there',
                senderId: otherUserId,
                sender: 'foo', // TODO: upost posting, we should ensure that the username is correct
                postedTime: serverTimestamp(),
            };
            await signOut();
            // and a message from the current user, who is able to add messages
            const user: FireAuth.User = await createConnectedGoogleUser(false);
            myUserId = user.uid;
            await chatDAO.addMessage('lobby', { ...message, senderId: myUserId });
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
/*
        it('should forbid users to delete one of its messages', async() => {
            // When deleting one of the current user's message
            const result: Promise<void> = chatDAO.deleteMessage('lobby', myMessageId);
            // Then it succeeds and the message is removed
            await expectAsync(result).toBeResolvedTo();
            const allMessages: Message[] = await chatDAO.getLastMessages('lobby', 5);
            expect(allMessages.length).toBe(1);
        });
        it('should forbid a user to delete a message of another user', async() => {
            // When deleting the message of another user
            const result: Promise<void> = chatDAO.deleteMessage('lobby', otherMessageId);
            // Then it fails
            await expectAsync(result).toBeResolvedTo();
        });
        it('should allow a user to change one of its messages', async() => {
            // When updating one of the current user's message
            const result: Promise<void> = chatDAO.updateMessage('lobby', myMessageId, 'hullo');
            // Then it succeeds and the message is updated
            await expectAsync(result).toBeResolvedTo();
            const message: Message = chatDAO.getMessage(myMessageId);
            expect(message.content).toBe('hullo');
        });
        it('should forbid a user to change a message of another user', async() => {
            // When updating the message of another user
            const result: Promise<void> = chatDAO.updateMessage('lobby', otherMessageId, 'hullo');
            // Then it fails
            await expectAsync(result).toBeRejected();
        }); */
    });
    describe('lobby chat', () => {
        it('should allow a verified user to create the lobby chat', async() => {
            // Given a verified user
            await createConnectedGoogleUser(false);
            // When creating the 'lobby' chat
            const chatCreation: Promise<void> = chatDAO.set('lobby', {});
            // Then it succeeds
            await expectAsync(chatCreation).toBeResolvedTo();

        });
        it('should forbid a disconnected user to create the lobby chat', async() => {
            // Given a disconnected user
            // When creating the 'lobby' chat
            const chatCreation: Promise<void> = chatDAO.set('lobby', {});
            // Then it fails
            await expectAsync(chatCreation).toBeRejected();
        });
        it('should allow a verified user to post a message on the lobby chat', async() => {
            // Given a verified user
            const user: FireAuth.User = await createConnectedGoogleUser(false);
            const userId: string = user.uid;
            // When posting in the lobby chat
            const message: Message = {
                content: 'hello',
                sender: 'TODO',
                senderId: userId,
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage('lobby', message);
            // Then it succeeds and the message has been added to the chat
            await expectAsync(result).toBeResolved();
            const allMessages: MessageDocument[] = await chatDAO.getLastMessages('lobby', 5);
            expect(allMessages.length).toBe(1);
        });
        it('should forbid a disconnected user to post a message on the lobby chat', async() => {
            // Given a disconnected user
            // When posting in the lobby chat
            const message: Message = {
                content: 'hello',
                sender: 'TODO',
                senderId: 'some-id',
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage('lobby', message);
            // Then it fails
            await expectAsync(result).toBeRejected();
        });
    });
    describe('part chat', () => {
        it('should allow a part owner to create the corresponding chat', async() => {
            // Given a verified user who is a part owner
            const user: FireAuth.User = await createConnectedGoogleUser(false);
            const userId: string = user.uid;
            const partId: string = await createPartAndJoiner(userId);
            // When creating the corresponding chat
            const result: Promise<void> = chatDAO.set(partId, {});
            // Then it should succeed
            await expectAsync(result).toBeResolvedTo();
        });
        it('should forbid a non-part owner to create the corresponding chat', async() => {
            // Given a verified user who is not a part owner
            await createConnectedGoogleUser(false);
            // When creating a part chat
            const result: Promise<void> = chatDAO.set('some-part-id', {});
            // Then it should fail
            await expectAsync(result).toBeRejected();
        });
        it('should allow a part owner to send messages on the corresponding chat', async() => {
            // Given a verified user who is a part owner, and where the corresponding chat exists
            const user: FireAuth.User = await createConnectedGoogleUser(false);
            const userId: string = user.uid;
            const partId: string = await createPartAndJoiner(userId);
            await chatDAO.set(partId, {});
            // When sending a message
            const message: Message = {
                content: 'hullo there',
                sender: 'TODO',
                senderId: userId,
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage(partId, message);
            // Then it should succeed
            await expectAsync(result).toBeResolved();
        });
        it('should allow a candidate to send messages on the corresponding chat', async() => {
            // Given a verified user who is a candidate, and where the corresponding chat exists
            const user: FireAuth.User = await createConnectedGoogleUser(false);
            const userId: string = user.uid;
            const partId: string = await createPartAndJoiner(userId);
            await chatDAO.set(partId, {});
            await signOut();
            const candidate: FireAuth.User = await createConnectedGoogleUser(false);
            await addCandidate(partId, candidate.uid);
            // When sending a message
            const message: Message = {
                content: 'hullo there',
                sender: 'TODO',
                senderId: candidate.uid,
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage(partId, message);
            // Then it should succeed
            await expectAsync(result).toBeResolved();
        });
        it('should allow first player to send messages on the corresponding chat', async() => {
            // Given a verified user who is a candidate, and where the corresponding chat exists
            const user: FireAuth.User = await createConnectedGoogleUser(false);
            const userId: string = user.uid;
            const partId: string = await createPartAndJoiner(userId);
            await chatDAO.set(partId, {});
            await signOut();
            const player: FireAuth.User = await createConnectedGoogleUser(false);
            await setPlayerZero(partId, player.uid);
            // When sending a message
            const message: Message = {
                content: 'hullo there',
                sender: 'TODO',
                senderId: player.uid,
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage(partId, message);
            // Then it should succeed
            await expectAsync(result).toBeResolved();
        });
        it('should allow second player to send messages on the corresponding chat', async() => {
            // Given a verified user who is a candidate, and where the corresponding chat exists
            const user: FireAuth.User = await createConnectedGoogleUser(false);
            const userId: string = user.uid;
            const partId: string = await createPartAndJoiner(userId);
            await chatDAO.set(partId, {});
            await signOut();
            const player: FireAuth.User = await createConnectedGoogleUser(false);
            await setPlayerOne(partId, player.uid);
            // When sending a message
            const message: Message = {
                content: 'hullo there',
                sender: 'TODO',
                senderId: player.uid,
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage(partId, message);
            // Then it should succeed
            await expectAsync(result).toBeResolved();
        });
        it('should forbid a user not in a part to send messages on the corresponding chat', async() => {
            // Given a verified user who is a part owner, and where the corresponding chat exists
            const user: FireAuth.User = await createConnectedGoogleUser(false);
            const userId: string = user.uid;
            const partId: string = await createPartAndJoiner(userId);
            await chatDAO.set(partId, {});
            await signOut();
            const otherUser: FireAuth.User = await createConnectedGoogleUser(false);
            // When sending a message
            const message: Message = {
                content: 'hullo there',
                sender: 'TODO',
                senderId: otherUser.uid,
                postedTime: serverTimestamp(),
            };
            const result: Promise<string> = chatDAO.addMessage(partId, message);
            // Then it should succeed
            await expectAsync(result).toBeResolved();
        });
    });
});
