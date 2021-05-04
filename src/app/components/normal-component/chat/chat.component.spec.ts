import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ChatComponent } from './chat.component';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ChatService } from 'src/app/services/chat/ChatService';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChatDAO } from 'src/app/dao/chat/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/chat/ChatDAOMock';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { PIChat } from 'src/app/domain/ichat';
import { AuthenticationServiceMock } from 'src/app/services/authentication/AuthenticationService.spec';

describe('ChatComponent', () => {
    let fixture: ComponentFixture<ChatComponent>;

    let component: ChatComponent;

    let chatService: ChatService;

    let chatDAO: ChatDAOMock;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatListModule, MatIconModule, MatInputModule, NoopAnimationsModule,
            ],
            declarations: [ChatComponent],
            providers: [
                { provide: ChatDAO, useClass: ChatDAOMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        component.chatId = 'fauxChat';
        chatService = TestBed.get(ChatService);
        chatDAO = TestBed.get(ChatDAO);
        chatDAO.set('fauxChat', { messages: [], status: 'dont have a clue' });

        AuthenticationServiceMock.setUser(AuthenticationService.NOT_CONNECTED);
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should not load message for unlogged user', async() => {
        spyOn(chatService, 'startObserving');
        spyOn(chatService, 'stopObserving');
        spyOn(component, 'showDisconnectedChat');
        spyOn(component, 'loadChatContent');

        component.ngOnInit();

        expect(chatService.startObserving).toHaveBeenCalledTimes(0);
        expect(component.loadChatContent).toHaveBeenCalledTimes(0);
        expect(component.showDisconnectedChat).toHaveBeenCalledTimes(1);

        component.ngOnDestroy();
        await fixture.whenStable();
        expect(chatService.stopObserving).toHaveBeenCalledTimes(0);
    });
    it('should propose to hide chat when chat is visible, and work', async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        fixture.detectChanges();
        let switchButton: DebugElement = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        let chat: DebugElement = fixture.debugElement.query(By.css('#chatForm'));
        expect(switchButton.nativeElement.innerText).toEqual('Réduire le chat (0 nouveau(x) message(s))');
        expect(chat).toBeTruthy('Chat should be visible on init');

        component.switchChatVisibility();
        fixture.detectChanges();

        switchButton = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        chat = fixture.debugElement.query(By.css('#chatForm'));
        expect(switchButton.nativeElement.innerText).toEqual('Afficher chat (0 nouveau(x) message(s))');
        expect(chat).toBeFalsy('Chat should be invisible after calling hideChat');
        component.ngOnDestroy();
        await fixture.whenStable();
    });
    it('should propose to show chat when chat is hidden, and work', async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        fixture.detectChanges();
        component.switchChatVisibility();
        fixture.detectChanges();

        let switchButton: DebugElement = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        let chat: DebugElement = fixture.debugElement.query(By.css('#chatForm'));
        expect(switchButton.nativeElement.innerText).toEqual('Afficher chat (0 nouveau(x) message(s))');
        expect(chat).toBeFalsy('Chat should be hidden');

        component.switchChatVisibility();
        fixture.detectChanges();

        switchButton = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        chat = fixture.debugElement.query(By.css('#chatForm'));
        expect(switchButton.nativeElement.innerText).toEqual('Réduire le chat (0 nouveau(x) message(s))');
        expect(chat).toBeTruthy('Chat should be visible after calling show');
        component.ngOnDestroy();
        await fixture.whenStable();
    });
    it('should show how many messages where sent since you hide the chat', async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        fixture.detectChanges();
        component.switchChatVisibility();
        fixture.detectChanges();
        let switchButton: DebugElement = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        expect(switchButton.nativeElement.innerText).toEqual('Afficher chat (0 nouveau(x) message(s))');

        await chatDAO.update('fauxChat', { messages: [{
            sender: 'roger',
            content: 'Saluuuut',
            lastTurnThen: 0,
            postedTime: 5,
        }] });
        fixture.detectChanges();

        switchButton = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        expect(switchButton.nativeElement.innerText).toEqual('Afficher chat (1 nouveau(x) message(s))');
    });
    it('should reset new messages count once messages have been read', async() => {
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        fixture.detectChanges();
        component.switchChatVisibility();
        fixture.detectChanges();
        const chat: PIChat = { messages: [{ sender: 'roger', content: 'Saluuuut', lastTurnThen: 0, postedTime: 5 }] };
        await chatDAO.update('fauxChat', chat);
        fixture.detectChanges();
        let switchButton: DebugElement = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        expect(switchButton.nativeElement.innerText).toEqual('Afficher chat (1 nouveau(x) message(s))');

        component.switchChatVisibility();
        fixture.detectChanges();

        switchButton = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        expect(switchButton.nativeElement.innerText).toEqual('Réduire le chat (0 nouveau(x) message(s))');
    });
    afterAll(() => {
        component.ngOnDestroy();
    });
});
