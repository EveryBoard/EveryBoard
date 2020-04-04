import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartCreationComponent } from './part-creation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule, MatRadioModule, MatSliderModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { GameService } from 'src/app/services/GameService';
import { JoinerService } from 'src/app/services/JoinerService';
import { ChatService } from 'src/app/services/chat-service/ChatService';
import { IJoinerId } from 'src/app/domain/ijoiner';

const gameServiceStub = {
    getActivesPartsObs: () => of([]),
    unSubFromActivesPartsObs: () => { return; },
};
const joinerServiceStub = {
    joinGame: () => {
        return new Promise((resolve, reject) => {
            resolve();
        });
    },
    stopObserving: () => {
        return;
    },
    startObserving: (jId: string, cb: (iJ: IJoinerId) => void) => {
        return;
    },
    cancelJoining: () => {
        return new Promise((resolve, reject) => {
            resolve();
        });
    },
};
const chatServiceStub = {

};
describe('PartCreationComponent', () => {

    let component: PartCreationComponent;

    let fixture: ComponentFixture<PartCreationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MatStepperModule, MatRadioModule, MatSliderModule,
                ReactiveFormsModule,
                RouterTestingModule,
            ],
            declarations: [PartCreationComponent],
            providers: [
                { provide: GameService,   useValue: gameServiceStub },
                { provide: JoinerService, useValue: joinerServiceStub },
                { provide: ChatService,   useValue: chatServiceStub },
            ],
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(PartCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', async(() => {
        expect(component).toBeTruthy();
    }));
    afterAll(async(() => {
        component.ngOnDestroy();
    }));
});