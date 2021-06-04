import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PartCreationComponent } from './part-creation.component';
import { JoinerService } from 'src/app/services/JoinerService';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { JoinerDAOMock } from 'src/app/dao/tests/JoinerDAOMock.spec';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { PartDAO } from 'src/app/dao/PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';
import { IPart } from 'src/app/domain/icurrentpart';
import { JoueursDAO } from 'src/app/dao/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/tests/JoueursDAOMock.spec';
import { IJoueur } from 'src/app/domain/iuser';
import { BlankComponent } from 'src/app/utils/tests/TestUtils.spec';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';

describe('PartCreationComponent:', () => {
    let fixture: ComponentFixture<PartCreationComponent>;

    let component: PartCreationComponent;

    let joinerDAOMock: JoinerDAOMock;

    let partDAOMock: PartDAOMock;

    let joueursDAOMock: JoueursDAOMock;

    const OPPONENT: IJoueur = {
        pseudo: 'firstCandidate',
        state: 'online',
    };

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [
                MatStepperModule,
                MatRadioModule,
                MatSliderModule,
                MatSnackBarModule,
                ReactiveFormsModule,
                RouterTestingModule.withRoutes(
                    [{ path: 'server', component: BlankComponent }],
                ),
                BrowserAnimationsModule,
            ],
            declarations: [PartCreationComponent],
            providers: [
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(PartCreationComponent);
        const chatDAOMock: ChatDAOMock = TestBed.get(ChatDAO);
        partDAOMock = TestBed.get(PartDAO);
        joinerDAOMock = TestBed.get(JoinerDAO);
        joueursDAOMock = TestBed.get(JoueursDAO);
        component = fixture.componentInstance;
        component.partId = 'joinerId';
        await chatDAOMock.set('joinerId', { messages: [], status: 'I don\'t have a clue TODO' });
        await joueursDAOMock.set('opponent', OPPONENT);
        await partDAOMock.set('joinerId', PartMocks.INITIAL.doc);
    }));
    it('(0) Player arrival on component should call joinGame and startObserving', fakeAsync(async() => {
        component.userName = 'creator';
        const joinerService: JoinerService = TestBed.get(JoinerService);
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        spyOn(joinerService, 'joinGame').and.callThrough();
        spyOn(joinerService, 'startObserving').and.callThrough();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(joinerService.joinGame).toHaveBeenCalledTimes(1);
        expect(joinerService.startObserving).toHaveBeenCalledTimes(1);
        expect(component).toBeTruthy('PartCreationComponent should have been created');
    }));
    it('(1) Joiner arrival should make candidate choice possible for creator', fakeAsync(async() => {
        component.userName = 'creator';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.debugElement.query(By.css('#chooseCandidate')))
            .toBeFalsy('Choosing candidate should be impossible before there is candidate');
        await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
        fixture.detectChanges();

        expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE.doc);
        expect(fixture.debugElement.query(By.css('#chooseCandidate')))
            .toBeTruthy('Choosing candidate should be possible after first candidate arrival');
    }));
    it('(2) Joiner arrival should change joiner doc', fakeAsync(async() => {
        component.userName = 'firstCandidate';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.currentJoiner).toEqual(JoinerMocks.WITH_FIRST_CANDIDATE.doc);
    }));
    it('(3) (4) Candidate choice should change joiner doc and make config proposal possible', fakeAsync(async() => {
        component.userName = 'creator';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        fixture.detectChanges();
        await fixture.whenStable();
        await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#presenceOf_firstCandidate')))
            .toBeTruthy('First candidate should be present in present player list');

        expect(fixture.debugElement.query(By.css('#proposeConfig')))
            .toBeFalsy('Proposing config should be impossible before there is a chosenPlayer');
        await component.setChosenPlayer('firstCandidate');
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('#selected_firstCandidate')))
            .toBeTruthy('First candidate should be present in present player list');
        expect(component.currentJoiner).toEqual(JoinerMocks.WITH_CHOSEN_PLAYER.doc);
        expect(fixture.debugElement.query(By.css('#proposeConfig')))
            .toBeTruthy('Choosing candidate should become possible after chosenPlayer is set');
    }));
    describe('Handshake end', () => {
        it('when chosenPlayer leaves lobby, part creation should go back from start', fakeAsync(async() => {
            component.userName = 'creator';
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
            fixture.detectChanges();
            tick();
            await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
            fixture.detectChanges();
            await component.setChosenPlayer('firstCandidate');
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('#selected_firstCandidate')))
                .toBeTruthy('First candidate should appear');
            await joinerDAOMock.update('joinerId', { partStatus: 0, chosenPlayer: '', candidates: [] });
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('#selected_firstCandidate')))
                .toBeFalsy('First candidate should no longer appear');
            expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL.doc);
        }));
        it('when chosenPlayer disconnect, part creation should go back from start', fakeAsync(async() => {
            component.userName = 'creator';
            await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
            fixture.detectChanges();
            tick();

            await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
            fixture.detectChanges();
            tick();

            await component.setChosenPlayer('firstCandidate');
            fixture.detectChanges();
            tick();

            expect(fixture.debugElement.query(By.css('#selected_firstCandidate')))
                .toBeTruthy('First candidate should appear');
            joueursDAOMock.update('opponent', { state: 'offline' });
            fixture.detectChanges();
            tick();

            expect(fixture.debugElement.query(By.css('#selected_firstCandidate')))
                .toBeFalsy('First candidate should no longer appear');
            expect(component.currentJoiner).toEqual(JoinerMocks.INITIAL.doc);
        }));
    });
    it('(8) Config proposal should make config acceptation possible for joiner', fakeAsync(async() => {
        component.userName = 'firstCandidate';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        fixture.detectChanges();
        await fixture.whenStable();
        await joinerDAOMock.update('joinerId',
                                   { partStatus: 1, candidates: [], chosenPlayer: 'firstCandidate' });
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('#acceptConfig')))
            .toBeFalsy('Config acceptation should not be possible before config proposal');
        await joinerDAOMock.update('joinerId',
                                   { partStatus: 2, maximalMoveDuration: 10, totalPartDuration: 60, firstPlayer: 'CREATOR' });
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('#acceptConfig')))
            .toBeTruthy('Config proposal should make config acceptation possible');
    }));
    it('(9) Config proposal by creator should change joiner doc', fakeAsync(async() => {
        component.userName = 'creator';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        fixture.detectChanges();
        await fixture.whenStable();
        await joinerDAOMock.update('joinerId', { candidates: ['firstCandidate'] });
        await fixture.whenStable();
        await joinerDAOMock.update('joinerId',
                                   { partStatus: 1, candidates: [], chosenPlayer: 'firstCandidate' });
        // TODO: replace by real actor action (chooseCandidate)
        await fixture.whenStable();
        fixture.detectChanges();

        await component.proposeConfig();
        fixture.detectChanges();

        expect(component.currentJoiner).toEqual(JoinerMocks.WITH_PROPOSED_CONFIG.doc);
    }));
    it('(10) Config acceptation by joiner should change joiner doc and part doc', fakeAsync(async() => {
        component.userName = 'firstCandidate';
        await joinerDAOMock.set('joinerId', JoinerMocks.INITIAL.doc);
        fixture.detectChanges(); // joiner arrival
        await fixture.whenStable();
        await joinerDAOMock.update('joinerId',
                                   { partStatus: 1, candidates: [], chosenPlayer: 'firstCandidate' });
        await fixture.whenStable();
        await joinerDAOMock.update('joinerId',
                                   { partStatus: 2, maximalMoveDuration: 10, totalPartDuration: 60, firstPlayer: 'CREATOR' });
        await fixture.whenStable();
        fixture.detectChanges();
        spyOn(component.gameStartNotification, 'emit');

        await component.acceptConfig();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(component.gameStartNotification.emit).toHaveBeenCalledWith(JoinerMocks.WITH_ACCEPTED_CONFIG.doc);
        expect(component.currentJoiner).toEqual(JoinerMocks.WITH_ACCEPTED_CONFIG.doc);
        const currentPart: IPart = partDAOMock.getStaticDB().get('joinerId').get().subject.value.doc;
        const expectedPart: IPart = { ...PartMocks.STARTING.doc, beginning: currentPart.beginning };
        expect(currentPart).toEqual(expectedPart);
    }));
    afterEach(fakeAsync(async() => {
        fixture.destroy();
        await fixture.whenStable();
        tick();
    }));
});
