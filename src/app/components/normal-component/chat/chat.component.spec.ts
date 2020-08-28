import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ChatComponent } from './chat.component';

import { of, Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ChatService } from 'src/app/services/chat/ChatService';
import { MatListModule, MatIconModule, MatInputModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { ChatDAO } from 'src/app/dao/chat/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/chat/ChatDAOMock';
import { By } from '@angular/platform-browser';

class AuthenticationServiceMock {

    public static CURRENT_USER: {pseudo: string, verified: boolean} = null;

    public static IS_USER_LOGGED: boolean = null;

    public getJoueurObs(): Observable<{pseudo: string, verified: boolean}> {
        if (AuthenticationServiceMock.CURRENT_USER == null)
            throw new Error("MOCK VALUE CURRENT_USER NOT SET BEFORE USE");
        return of(AuthenticationServiceMock.CURRENT_USER);
    }
    public isUserLogged(): boolean {
        if (AuthenticationServiceMock.IS_USER_LOGGED == null)
            throw new Error("MOCK IS_USER_LOGGED VALUE NOT SET BEFORE USE");
        else
            return AuthenticationServiceMock.IS_USER_LOGGED;
    }
};
describe('ChatComponent', () => {

    let fixture: ComponentFixture<ChatComponent>;

    let component: ChatComponent;

    let chatService: ChatService;

    let chatDAO: ChatDAOMock;

    beforeAll(() => {
        ChatComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || ChatComponent.VERBOSE;
    });
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatListModule, MatIconModule, MatInputModule, NoopAnimationsModule,
            ],
            declarations: [ ChatComponent ],
            providers: [
                { provide: ChatDAO,               useClass: ChatDAOMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        component.chatId = "fauxChat";
        chatService = TestBed.get(ChatService);
        chatDAO = TestBed.get(ChatDAO);
        chatDAO.set("fauxChat", { messages: [], status: "dont have a clue" });

        AuthenticationServiceMock.CURRENT_USER = { pseudo: null, verified: null};
        AuthenticationServiceMock.IS_USER_LOGGED = null;
    }));
    it('should create', async(() => {
        expect(component).toBeTruthy();
    }));
    it('should not load message for unlogged user', async(async () => {
        const startObservingSpy = spyOn(chatService, "startObserving");
        const stopObservingSpy = spyOn(chatService, "stopObserving");
        const showDisconnectedChatSpy = spyOn(component, "showDisconnectedChat");
        const loadChatContentSpy = spyOn(component, "loadChatContent");

        component.ngOnInit();

        expect(startObservingSpy).toHaveBeenCalledTimes(0);
        expect(loadChatContentSpy).toHaveBeenCalledTimes(0);
        expect(showDisconnectedChatSpy).toHaveBeenCalledTimes(1);

        component.ngOnDestroy();
        await fixture.whenStable();
        expect(stopObservingSpy).toHaveBeenCalledTimes(0);
    }));
    it('should propose to hide chat when chat is visible, and work', async(async () => {
        AuthenticationServiceMock.CURRENT_USER = { pseudo: "Jean-Connecté", verified: true};
        fixture.detectChanges();
        let switchButton = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        let chat = fixture.debugElement.query(By.css('#chatForm'));
        expect(switchButton.nativeElement.innerText).toEqual("Hide chat (0 new messages)");
        expect(chat).toBeTruthy("Chat should be visible on init");

        component.switchChatVisibility();
        fixture.detectChanges();

        switchButton = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        chat = fixture.debugElement.query(By.css('#chatForm'));
        expect(switchButton.nativeElement.innerText).toEqual("Show chat (0 new messages)");
        expect(chat).toBeFalsy("Chat should be invisible after calling hideChat");
        component.ngOnDestroy();
        await fixture.whenStable();
    }));
    it('should propose to show chat when chat is hidden, and work', async(async () => {
        AuthenticationServiceMock.CURRENT_USER = { pseudo: "Jean-Connecté", verified: true};
        fixture.detectChanges();
        component.switchChatVisibility();
        fixture.detectChanges();

        let switchButton = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        let chat = fixture.debugElement.query(By.css('#chatForm'));
        expect(switchButton.nativeElement.innerText).toEqual("Show chat (0 new messages)");
        expect(chat).toBeFalsy("Chat should be hidden");

        component.switchChatVisibility();
        fixture.detectChanges();

        switchButton = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        chat = fixture.debugElement.query(By.css('#chatForm'));
        expect(switchButton.nativeElement.innerText).toEqual("Hide chat (0 new messages)");
        expect(chat).toBeTruthy("Chat should be visible after calling show");
        component.ngOnDestroy();
        await fixture.whenStable();
    }));
    it('should show how many messages where sent since you hide the chat', async(async() => {
        AuthenticationServiceMock.CURRENT_USER = { pseudo: "Jean-Connecté", verified: true};
        fixture.detectChanges();
        component.switchChatVisibility();
        fixture.detectChanges();
        let switchButton = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        expect(switchButton.nativeElement.innerText).toEqual("Show chat (0 new messages)");

        chatDAO.update("fauxChat", { messages : [ {
            sender: "roger",
            content: "Saluuuut",
            lastTurnThen: 0,
            postedTime: 5
        }]});
        fixture.detectChanges();

        switchButton = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        expect(switchButton.nativeElement.innerText).toEqual("Show chat (1 new messages)");
    }));
    it('should reset new messages count once messages have been read', async(async() => {
        AuthenticationServiceMock.CURRENT_USER = { pseudo: "Jean-Connecté", verified: true};
        fixture.detectChanges();
        component.switchChatVisibility();
        fixture.detectChanges();
        chatDAO.update("fauxChat", { messages : [ { sender: "roger", content: "Saluuuut", lastTurnThen: 0, postedTime: 5}]});
        fixture.detectChanges();
        let switchButton = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        expect(switchButton.nativeElement.innerText).toEqual("Show chat (1 new messages)");

        component.switchChatVisibility();
        fixture.detectChanges();

        switchButton = fixture.debugElement.query(By.css('#switchChatVisibilityButton'));
        expect(switchButton.nativeElement.innerText).toEqual("Hide chat (0 new messages)");
    }));
    afterAll(async(() => {
        component.ngOnDestroy();
    }));
});