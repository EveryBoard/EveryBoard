import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartCreationComponent } from './part-creation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule, MatRadioModule, MatSliderModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { GameService } from 'src/app/services/game/GameService';
import { JoinerService } from 'src/app/services/joiner/JoinerService';
import { ChatService } from 'src/app/services/chat/ChatService';
import { IJoinerId } from 'src/app/domain/ijoiner';

const gameServiceStub = {
    getActivesPartsObs: () => of([]),
    unSubFromActivesPartsObs: () => {},
};
class JoinerServiceMock {
    public joinGame(): Promise<void> {
        return new Promise(resolve => { resolve(); });
    }
    public stopObserving() {
        return;
    }
    public startObserving(jId: string, cb: (iJ: IJoinerId) => void) {
    }
    public cancelJoining() {
        return new Promise(resolve => { resolve(); });
    }
};
const chatServiceStub = {
};
describe('PartCreationComponent', () => {

    let component: PartCreationComponent;
    let joinerService: JoinerService;
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
                { provide: JoinerService, useClass: JoinerServiceMock },
                { provide: ChatService,   useValue: chatServiceStub },
            ],
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(PartCreationComponent);
        component = fixture.componentInstance;
        joinerService = TestBed.get(JoinerService);
    });
    it('should create', async(() => {
        expect(component).toBeTruthy();
        const ngOnInit = spyOn(component, "ngOnInit").and.callThrough();
        expect(ngOnInit).not.toHaveBeenCalled();
        
        fixture.detectChanges();
        
        expect(ngOnInit).toHaveBeenCalledTimes(1);
    }));
    it('should join game and start observing it on init', async(async () => {
        expect(component).toBeTruthy();
        expect(component.gameStarted).toBeFalsy("Game should not be created at start");
        const joinGameSpy = spyOn(joinerService, "joinGame").and.callThrough();
        const startObservingSpy = spyOn(joinerService, "startObserving").and.callThrough();
        expect(joinGameSpy).toHaveBeenCalledTimes(0);
        expect(startObservingSpy).toHaveBeenCalledTimes(0);

        await component.ngOnInit();

        expect(joinGameSpy).toHaveBeenCalledTimes(1);
        expect(startObservingSpy).toHaveBeenCalledTimes(1);
    }));
    afterAll(async(() => {
        component.ngOnDestroy();
    }));
});