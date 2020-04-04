import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ChatComponent } from './chat.component';

import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication-service/AuthenticationService';
import { ChatService } from 'src/app/services/chat-service/ChatService';
import { MatListModule, MatIconModule, MatInputModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IChatId } from 'src/app/domain/ichat';

const chatServiceStub = {
    startObserving: (cId: string, cb: (IChatId: IChatId) => void) => {
        return;
    },
};
const authenticationServiceStub = {
    getJoueurObs: () => of({ pseudo: 'Pseudo', verified: true}),
};
describe('ChatComponent', () => {

    let component: ChatComponent;

    let fixture: ComponentFixture<ChatComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                MatListModule, MatIconModule, MatInputModule, NoopAnimationsModule,
            ],
            declarations: [ ChatComponent ],
            providers: [
                { provide: ChatService,           useValue: chatServiceStub },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ]
        })
            .compileComponents();
    }));
    beforeEach(async(() => {
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        component.chatId = "fauxChat";
        fixture.detectChanges();
    }));
    it('should create', async(() => {
        expect(component).toBeTruthy();
    }));
});