import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { PartCreationComponent } from './part-creation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule, MatRadioModule, MatSliderModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { GameService } from 'src/app/services/game/GameService';
import { JoinerService } from 'src/app/services/joiner/JoinerService';
import { ChatService } from 'src/app/services/chat/ChatService';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { JoinerServiceMock } from 'src/app/services/joiner/JoinerServiceMock';

const gameServiceStub = {

    getActivesPartsObs: () => of([]),

    unSubFromActivesPartsObs: () => { },

    deletePart: (partId: string) => of(),
};
const chatServiceStub = {

    deleteChat: (chatId: string) => of(),
};
describe('PartCreationComponent Direct', () => {

    let component: PartCreationComponent;

    let fixture: ComponentFixture<PartCreationComponent>;

    let joinerService: JoinerService;

    beforeAll(() => {
        PartCreationComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || PartCreationComponent.VERBOSE;
    });
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MatStepperModule, MatRadioModule, MatSliderModule,
                ReactiveFormsModule,
                RouterTestingModule,
            ],
            declarations: [ PartCreationComponent],
            providers: [
                { provide: GameService, useValue: gameServiceStub },
                { provide: JoinerService, useClass: JoinerServiceMock },
                { provide: ChatService, useValue: chatServiceStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PartCreationComponent);
        component = fixture.componentInstance;
        joinerService = TestBed.get(JoinerService);

        JoinerServiceMock.emittedsJoiner = null;
    }));
    it('should create', async(() => {
        JoinerServiceMock.emittedsJoiner = [];
        component.userName = "whoever";
        component.partId = "whatever";
        fixture.detectChanges();
        
        expect(component).toBeTruthy("PartCreationComponent should have been created");
    }));
    it('should join game and start observing it on init (0)', async(async () => {
        JoinerServiceMock.emittedsJoiner = [ JoinerServiceMock.JOINERS.JOINER_INITIAL ];
        expect(component).toBeTruthy();
        expect(component.gameStarted).toBeFalsy("Game should not be created at start");
        component.userName = "whoever";
        component.partId = "whatever";
        const joinGameSpy = spyOn(joinerService, "joinGame").and.callThrough();
        const startObservingSpy = spyOn(joinerService, "startObserving").and.callThrough();
        expect(joinGameSpy).toHaveBeenCalledTimes(0);
        expect(startObservingSpy).toHaveBeenCalledTimes(0);

        await component.ngOnInit();

        expect(joinGameSpy).toHaveBeenCalledTimes(1);
        expect(startObservingSpy).toHaveBeenCalledTimes(1);
    }));
    it('should offer creator the choice of candidate when the first one arrive (1)', fakeAsync(() => {
        JoinerServiceMock.emittedsJoiner = [
            JoinerServiceMock.JOINERS.JOINER_INITIAL,
            JoinerServiceMock.JOINERS.JOINER_WITH_FIRST_CANDIDATE
        ];
        component.userName = "whoever";
        component.partId = "whatever";
        fixture.detectChanges();
//        hostComponent.wrappedComponent.ngOnInit();
        expect(component.currentJoiner).toBeNull();
        tick(1000);
        expect(component.currentJoiner).toEqual(JoinerServiceMock.JOINERS.JOINER_INITIAL.joiner);
        tick(1000);
        expect(component.currentJoiner).toEqual(JoinerServiceMock.JOINERS.JOINER_WITH_FIRST_CANDIDATE.joiner);
        tick(2000);
        component.setChosenPlayer("firstCandidate");
    }));
    it('should offer creator the choice of part configuration when the opponent is selected (2)', fakeAsync(() => { 
        JoinerServiceMock.emittedsJoiner = [
            JoinerServiceMock.JOINERS.JOINER_INITIAL,
            JoinerServiceMock.JOINERS.JOINER_WITH_FIRST_CANDIDATE,
            JoinerServiceMock.JOINERS.JOINER_WITH_SECOND_CANDIDATE,
            JoinerServiceMock.JOINERS.JOINER_WITH_CHOSEN_PLAYER
        ];
        component.userName = "creator";
        component.partId = "whatever";
        component.ngOnInit();

        expect(component.currentJoiner).toBeNull();
        tick(4000);
        expect(component.currentJoiner).toBe(JoinerServiceMock.JOINERS.JOINER_WITH_CHOSEN_PLAYER.joiner,
                                             "Fourth emitted joiner doc should be one with a chosenPlayer");
        expect(component.userIsCreator).toBeTruthy("User should be creator to test this");
        component.proposeConfig();

        
    }));
    afterEach(async(() => {
        component.ngOnDestroy();
    }));
});
