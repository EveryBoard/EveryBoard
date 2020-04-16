import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ChatComponent } from './chat.component';

import { of, Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ChatService } from 'src/app/services/chat/ChatService';
import { MatListModule, MatIconModule, MatInputModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IChatId } from 'src/app/domain/ichat';

class ChatServiceMock {

    public startObserving(cId: string, cb: (iChatId: IChatId) => void) {
    };
    public stopObserving() {
    };
    public isObserving(): boolean {
        return;
    }
};
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

    let authenticationService: AuthenticationService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatListModule, MatIconModule, MatInputModule, NoopAnimationsModule,
            ],
            declarations: [ ChatComponent ],
            providers: [
                { provide: ChatService,           useClass: ChatServiceMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
            ]
        })
            .compileComponents();
    }));
    beforeEach(async(() => {
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        component.chatId = "fauxChat";
        chatService = TestBed.get(ChatService);
        authenticationService = TestBed.get(AuthenticationService);

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
    afterAll(async(() => {
        component.ngOnDestroy();
    }));
});