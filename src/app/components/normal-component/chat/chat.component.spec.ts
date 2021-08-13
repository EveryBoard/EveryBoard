import { fakeAsync, TestBed } from '@angular/core/testing';

import { ChatComponent } from './chat.component';

import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { ChatService } from 'src/app/services/ChatService';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { DebugElement } from '@angular/core';
import { IChat } from 'src/app/domain/ichat';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';

describe('ChatComponent', () => {
    let testUtils: SimpleComponentTestUtils<ChatComponent>;

    let component: ChatComponent;

    let chatService: ChatService;

    let chatDAO: ChatDAO;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(ChatComponent);
        component = testUtils.getComponent();
        component.chatId = 'fauxChat';
        component.turn = 2;
        chatService = TestBed.inject(ChatService);
        chatDAO = TestBed.inject(ChatDAO);
        chatDAO.set('fauxChat', { messages: [] });
    }));
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should not observe (load messages) and show disconnected chat for unlogged user', fakeAsync(async() => {
        spyOn(chatService, 'startObserving');
        spyOn(chatService, 'stopObserving');
        spyOn(component, 'loadChatContent');
        // given that the user is not connected
        AuthenticationServiceMock.setUser(AuthenticationService.NOT_CONNECTED);

        // when the component is initialized
        component.ngOnInit();
        testUtils.detectChanges();

        // It should not observe, not load the chat content, and show the disconnected chat
        expect(chatService.startObserving).toHaveBeenCalledTimes(0);
        expect(component.loadChatContent).toHaveBeenCalledTimes(0);
        testUtils.expectElementToExist('#disconnected-chat');

        component.ngOnDestroy();
        await testUtils.whenStable();
        expect(chatService.stopObserving).toHaveBeenCalledTimes(0);
    }));
    it('should propose to hide chat when chat is visible, and work', fakeAsync(async() => {
        // Given the user is connected
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        testUtils.detectChanges();
        let switchButton: DebugElement = testUtils.findElement('#switchChatVisibilityButton');
        let chat: DebugElement = testUtils.findElement('#chatForm');
        expect(switchButton.nativeElement.innerText).toEqual('Réduire le chat');
        expect(chat).withContext('Chat should be visible on init').toBeTruthy();

        // when switching the chat visibility
        testUtils.clickElement('#switchChatVisibilityButton');
        testUtils.detectChanges();

        switchButton = testUtils.findElement('#switchChatVisibilityButton');
        chat = testUtils.findElement('#chatForm');
        // Then the chat is not visible and the button changes its text
        expect(switchButton.nativeElement.innerText).toEqual('Afficher le chat (0 nouveau(x) message(s))');
        expect(chat).withContext('Chat should be invisible after calling hideChat').toBeFalsy();
    }));
    it('should propose to show chat when chat is hidden, and work', fakeAsync(async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        testUtils.detectChanges();
        testUtils.clickElement('#switchChatVisibilityButton');
        testUtils.detectChanges();

        // Given that the chat is hidden
        let switchButton: DebugElement = testUtils.findElement('#switchChatVisibilityButton');
        let chat: DebugElement = testUtils.findElement('#chatForm');
        expect(switchButton.nativeElement.innerText).toEqual('Afficher le chat (0 nouveau(x) message(s))');
        expect(chat).withContext('Chat should be hidden').toBeFalsy();

        // when showing the chat
        testUtils.clickElement('#switchChatVisibilityButton');
        testUtils.detectChanges();

        // then the chat is shown
        switchButton = testUtils.findElement('#switchChatVisibilityButton');
        chat = testUtils.findElement('#chatForm');
        expect(switchButton.nativeElement.innerText).toEqual('Réduire le chat');
        expect(chat).withContext('Chat should be visible after calling show').toBeTruthy();
    }));
    it('should show how many messages where sent since you hide the chat', fakeAsync(async() => {
        // Given a hidden chat with no message
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        testUtils.detectChanges();
        testUtils.clickElement('#switchChatVisibilityButton');
        testUtils.detectChanges();
        let switchButton: DebugElement = testUtils.findElement('#switchChatVisibilityButton');
        expect(switchButton.nativeElement.innerText).toEqual('Afficher le chat (0 nouveau(x) message(s))');

        // when a new message is received
        await chatDAO.update('fauxChat', { messages: [{
            sender: 'roger',
            content: 'Saluuuut',
            currentTurn: 0,
            postedTime: 5,
        }] });
        testUtils.detectChanges();

        // then the button shows how many new messages there are
        switchButton = testUtils.findElement('#switchChatVisibilityButton');
        expect(switchButton.nativeElement.innerText).toEqual('Afficher le chat (1 nouveau(x) message(s))');
    }));
    it('should reset new messages count once messages have been read', fakeAsync(async() => {
        // Given a hidden chat with one unseen message
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        testUtils.detectChanges();
        testUtils.clickElement('#switchChatVisibilityButton');
        testUtils.detectChanges();
        const chat: Partial<IChat> = { messages: [{ sender: 'roger', content: 'Saluuuut', currentTurn: 0, postedTime: 5 }] };
        await chatDAO.update('fauxChat', chat);
        testUtils.detectChanges();
        let switchButton: DebugElement = testUtils.findElement('#switchChatVisibilityButton');
        expect(switchButton.nativeElement.innerText).toEqual('Afficher le chat (1 nouveau(x) message(s))');

        // When the chat is shown and then hidden again
        testUtils.clickElement('#switchChatVisibilityButton');
        testUtils.detectChanges();
        testUtils.clickElement('#switchChatVisibilityButton');
        testUtils.detectChanges();

        // Then the button text is updated
        switchButton = testUtils.findElement('#switchChatVisibilityButton');
        expect(switchButton.nativeElement.innerText).toEqual('Afficher le chat (0 nouveau(x) message(s))');
    }));
    it('should send messages using the chat service', fakeAsync(async() => {
        spyOn(chatService, 'sendMessage');
        // given chat
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        testUtils.detectChanges();

        // when the form is filled and the send button clicked
        const messageInput: DebugElement = testUtils.findElement('#message');
        messageInput.nativeElement.value = 'hello';
        testUtils.detectChanges();
        testUtils.clickElement('#send');
        testUtils.detectChanges();
        await testUtils.whenStable();

        // then the message is sent and the form is cleared
        expect(chatService.sendMessage).toHaveBeenCalledWith(AuthenticationServiceMock.CONNECTED.pseudo, 2, 'hello');
        expect(messageInput.nativeElement.value).toBe('');
    }));
    afterAll(() => {
        component.ngOnDestroy();
    });
});
