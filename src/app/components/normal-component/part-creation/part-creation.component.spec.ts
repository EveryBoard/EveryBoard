import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { PartCreationComponent } from './part-creation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule, MatRadioModule, MatSliderModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { GameService } from 'src/app/services/game/GameService';
import { JoinerService } from 'src/app/services/joiner/JoinerService';
import { ChatService } from 'src/app/services/chat/ChatService';
import { IJoinerId } from 'src/app/domain/ijoiner';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

const gameServiceStub = {
    getActivesPartsObs: () => of([]),
    unSubFromActivesPartsObs: () => { },
};
class JoinerServiceMock {

    public static JOINERS = {
        JOINER_INITIAL: {
            id: 'joinerId',
            joiner: {
                candidatesNames: [],
                creator: 'creator',
                chosenPlayer: '', // TODO: Make optional
                firstPlayer: '0', // TODO: Make optional AND enum
                partStatus: 0
            }
        },
        JOINER_WITH_FIRST_CANDIDATE: {
            id: 'joinerId',
            joiner: {
                candidatesNames: ['firstCandidate'],
                creator: 'creator',
                chosenPlayer: '', // TODO: Make optional
                firstPlayer: '0', // TODO: Make optional AND enum
                partStatus: 0
            }
        },
        JOINER_WITH_SECOND_CANDIDATE: {
            id: 'joinerId',
            joiner: {
                candidatesNames: ['firstCandidate', 'secondCandidate'],
                creator: 'creator',
                chosenPlayer: '', // TODO: Make optional
                firstPlayer: '0', // TODO: Make optional AND enum
                partStatus: 0
            }
        },
        JOINER_WITH_CHOSEN_PLAYER: {
            id: 'joinerId',
            joiner: {
                candidatesNames: ['firstCandidate', 'secondCandidate'],
                creator: 'creator',
                chosenPlayer: 'firstCandidate', // TODO: Make optional
                firstPlayer: '0', // TODO: Make optional AND enum
                partStatus: 1
            }
        }
    };
    public static emittedsJoiner: IJoinerId[];

    public joinGame(): Promise<void> {
        return new Promise(resolve => { resolve(); });
    }
    public stopObserving() {
        return;
    }
    public startObserving(jId: string, callback: (iJ: IJoinerId) => void) {
        let i: number = 0;
        while (i<JoinerServiceMock.emittedsJoiner.length) {
            setTimeout(
                (index: number) => callback(JoinerServiceMock.emittedsJoiner[index]),
                1000*(i+1),
                i
            );
            i++;
        }
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

    beforeAll(() => {
        PartCreationComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
    });
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                MatStepperModule, MatRadioModule, MatSliderModule,
                ReactiveFormsModule,
                RouterTestingModule,
            ],
            declarations: [PartCreationComponent],
            providers: [
                { provide: GameService, useValue: gameServiceStub },
                { provide: JoinerService, useClass: JoinerServiceMock },
                { provide: ChatService, useValue: chatServiceStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PartCreationComponent);
        component = fixture.componentInstance;
        joinerService = TestBed.get(JoinerService);
    }));
    it('should create', async(() => {
        JoinerServiceMock.emittedsJoiner = [];
        expect(component).toBeTruthy();
        const ngOnInit = spyOn(component, "ngOnInit").and.callThrough();
        expect(ngOnInit).not.toHaveBeenCalled();

        fixture.detectChanges();

        expect(ngOnInit).toHaveBeenCalledTimes(1);
    }));
    it('should join game and start observing it on init (0)', async(async () => {
        JoinerServiceMock.emittedsJoiner = [ JoinerServiceMock.JOINERS.JOINER_INITIAL ];
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
    it('should offer creator the choice of candidate when the first one arrive (1)', fakeAsync(() => {
        JoinerServiceMock.emittedsJoiner = [
            JoinerServiceMock.JOINERS.JOINER_INITIAL,
            JoinerServiceMock.JOINERS.JOINER_WITH_FIRST_CANDIDATE
        ];
        component.ngOnInit();
        expect(component.currentJoiner).toBeNull();
        tick(1000);
        expect(component.currentJoiner).toEqual(JoinerServiceMock.JOINERS.JOINER_INITIAL.joiner);
        tick(1000);
        expect(component.currentJoiner).toEqual(JoinerServiceMock.JOINERS.JOINER_WITH_FIRST_CANDIDATE.joiner);
        tick(2000);
        // TODO: test view
    }));
    it('should offer creator the choice of part configuration when the opponent is selected (2)', fakeAsync(() => {
        JoinerServiceMock.emittedsJoiner = [
            JoinerServiceMock.JOINERS.JOINER_INITIAL,
            JoinerServiceMock.JOINERS.JOINER_WITH_FIRST_CANDIDATE,
            JoinerServiceMock.JOINERS.JOINER_WITH_SECOND_CANDIDATE,
            JoinerServiceMock.JOINERS.JOINER_WITH_CHOSEN_PLAYER
        ];
        component.ngOnInit();
        expect(component.currentJoiner).toBeNull();
        tick(1000);
        expect(component.currentJoiner).toBe(JoinerServiceMock.JOINERS.JOINER_INITIAL.joiner,
                                             "First emitted joiner doc should be one with only the creator in it");
        tick(1000);
        expect(component.currentJoiner).toBe(JoinerServiceMock.JOINERS.JOINER_WITH_FIRST_CANDIDATE.joiner,
                                             "Second emitted joiner doc should be one with only one candidate");
        tick(1000);
        expect(component.currentJoiner).toBe(JoinerServiceMock.JOINERS.JOINER_WITH_SECOND_CANDIDATE.joiner,
                                             "Third emitted joiner doc should be one with two candidates");
        tick(1000);
        expect(component.currentJoiner).toBe(JoinerServiceMock.JOINERS.JOINER_WITH_CHOSEN_PLAYER.joiner,
                                             "Fourth emitted joiner doc should be one with a chosenPlayer");
    }));
    afterAll(async(() => {
        component.ngOnDestroy();
    }));
});
