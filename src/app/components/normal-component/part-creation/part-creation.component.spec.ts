import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule, MatRadioModule, MatSliderModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { of, Observable } from 'rxjs';

import { PartCreationComponent } from './part-creation.component';
import { ICurrentPartId } from 'src/app/domain/icurrentpart';
import { GameService } from 'src/app/services/game/GameService';
import { JoinerService } from 'src/app/services/joiner/JoinerService';
import { ChatService } from 'src/app/services/chat/ChatService';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { JoinerDAO } from 'src/app/dao/joiner/JoinerDAO';
import { JoinerDAOMock } from 'src/app/dao/joiner/JoinerDAOMock';
import { JoinerMocks } from 'src/app/domain/JoinerMocks';
import { IJoiner } from 'src/app/domain/ijoiner';
import { PartDAOMock } from 'src/app/dao/part/PartDAOMock';
import { PartDAO } from 'src/app/dao/part/PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks';

class GameServiceMock {

    public getActivesPartsObs(): Observable<ICurrentPartId[]> {
        return of([]);
    }
    public unSubFromActivesPartsObs() {
    }
    public async deletePart(partId: string): Promise<void> {
        return Promise.resolve();
    }
    public async acceptConfig(joiner: IJoiner): Promise<void> {
        return Promise.resolve();
    }
};
class ChatServiceMock {

    public async deleteChat(chatId: string): Promise<void> {
        return Promise.resolve();
    }
};
class RouterMock {
    public async navigate(to: string[]): Promise<boolean> {
        return Promise.resolve(true);
    };
}
describe('PartCreationComponent with fixture:', () => {

    let fixture: ComponentFixture<PartCreationComponent>;

    let component: PartCreationComponent;

    let partDAOMock: PartDAOMock;

    beforeAll(() => {
        PartCreationComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || PartCreationComponent.VERBOSE;
    });
    beforeEach(async(async() => {
        await TestBed.configureTestingModule({
            imports: [
                MatStepperModule, MatRadioModule, MatSliderModule,
                ReactiveFormsModule,
                RouterTestingModule,
                BrowserAnimationsModule,
            ],
            declarations: [ PartCreationComponent ],
            providers: [
                { provide: PartDAO,     useClass: PartDAOMock },
                { provide: JoinerDAO,   useClass: JoinerDAOMock },
                { provide: ChatService, useClass: ChatServiceMock },
                { provide: Router,      useClass: RouterMock },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(PartCreationComponent);
        partDAOMock = TestBed.get(PartDAO);
        component = fixture.componentInstance;
        component.partId = "joinerId";
        await partDAOMock.set("joinerId", PartMocks.INITIAL.copy());
    }));
    it('(0) Player arrival on component should call joinGame and startObserving', async(async() => {
        component.userName = "creator";
        const joinerService: JoinerService = TestBed.get(JoinerService);
        await JoinerDAOMock.set("joinerId", JoinerMocks.JOINER_INITIAL.copy());
        const joinGameSpy = spyOn(joinerService, "joinGame").and.callThrough();
        const startObservingSpy = spyOn(joinerService, "startObserving").and.callThrough();
        expect(joinGameSpy).toHaveBeenCalledTimes(0);
        expect(startObservingSpy).toHaveBeenCalledTimes(0);

        fixture.detectChanges();
        await fixture.whenStable();
        
        expect(joinGameSpy).toHaveBeenCalledTimes(1);
        expect(startObservingSpy).toHaveBeenCalledTimes(1);
        expect(component).toBeTruthy("PartCreationComponent should have been created");
    }));
    it('(1) Joiner arrival should make candidate choice possible for creator', async(async() => {
        component.userName = "creator";
        await JoinerDAOMock.set("joinerId", JoinerMocks.JOINER_INITIAL.copy());
        fixture.detectChanges();
        await fixture.whenStable();
    
        expect(fixture.debugElement.query(By.css('#chooseCandidate'))).toBeFalsy("Choosing candidate should be impossible before there is candidate");
        await JoinerDAOMock.update("joinerId", { candidatesNames : ["firstCandidate"] });
        fixture.detectChanges();

        expect(component.currentJoiner).toEqual(JoinerMocks.JOINER_WITH_FIRST_CANDIDATE.copy());
        expect(fixture.debugElement.query(By.css('#chooseCandidate'))).toBeTruthy("Choosing candidate should be possible after first candidate arrival");
    }));
    it('(2) Joiner arrival should change joiner doc', async(async() => {
        component.userName = "firstCandidate";
        await JoinerDAOMock.set("joinerId", JoinerMocks.JOINER_INITIAL.copy());
        
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.currentJoiner).toEqual(JoinerMocks.JOINER_WITH_FIRST_CANDIDATE.copy());
    }));
    it('(3) (4) Candidate choice should change joiner doc and make config proposal possible', async(async() => {
        component.userName = "creator";
        await JoinerDAOMock.set("joinerId", JoinerMocks.JOINER_INITIAL.copy());
        fixture.detectChanges();
        await fixture.whenStable();
        await JoinerDAOMock.update("joinerId", { candidatesNames : ["firstCandidate"] });

        expect(fixture.debugElement.query(By.css('#proposeConfig'))).toBeFalsy("Proposing config should be impossible before there is a chosenPlayer");
        await component.setChosenPlayer("firstCandidate");
        fixture.detectChanges();

        expect(component.currentJoiner).toEqual(JoinerMocks.JOINER_WITH_CHOSEN_PLAYER.copy());
        expect(fixture.debugElement.query(By.css('#proposeConfig'))).toBeTruthy("Choosing candidate should become possible after chosenPlayer is set");
    }));
    it('(8) Config proposal should make config acceptation possible for joiner', async(async() => {
        component.userName = "firstCandidate";
        await JoinerDAOMock.set("joinerId", JoinerMocks.JOINER_INITIAL.copy());
        fixture.detectChanges();
        await fixture.whenStable();
        await JoinerDAOMock.update("joinerId",
                                   { partStatus: 1, candidatesNames : [], chosenPlayer: "firstCandidate"});
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('#acceptConfig'))).toBeFalsy("Config acceptation should not be possible before config proposal");
        await JoinerDAOMock.update("joinerId", 
                                   { partStatus: 2, maximalMoveDuration: 10, totalPartDuration: 60, firstPlayer: '' });
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('#acceptConfig'))).toBeTruthy("Config proposal should make config acceptation possible");
    }));
    it('(9) Config proposal by creator should change joiner doc', async(async() => {
        component.userName = "creator";
        await JoinerDAOMock.set("joinerId", JoinerMocks.JOINER_INITIAL.copy());
        fixture.detectChanges();
        await fixture.whenStable();
        await JoinerDAOMock.update("joinerId", { candidatesNames : ["firstCandidate"] });
        await fixture.whenStable();
        await JoinerDAOMock.update("joinerId",
                                   { partStatus: 1, candidatesNames : [], chosenPlayer: "firstCandidate"});
        await fixture.whenStable();
        fixture.detectChanges();

        await component.proposeConfig();
        fixture.detectChanges();

        expect(component.currentJoiner).toEqual(JoinerMocks.JOINER_WITH_PROPOSED_CONFIG.copy());
    }));
    it('(10) Config acceptation by joiner should change joiner doc', async(async() => {
        component.userName = "firstCandidate";
        await JoinerDAOMock.set("joinerId", JoinerMocks.JOINER_INITIAL.copy());
        fixture.detectChanges(); // joiner arrival
        await fixture.whenStable();
        await JoinerDAOMock.update("joinerId",
                                   { partStatus: 1, candidatesNames : [], chosenPlayer: "firstCandidate"});
        await fixture.whenStable();
        await JoinerDAOMock.update("joinerId",
                                   { partStatus: 2, maximalMoveDuration: 10, totalPartDuration: 60, firstPlayer: '0'});
        await fixture.whenStable();
        fixture.detectChanges();
        
        await component.acceptConfig();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(component.currentJoiner).toEqual(JoinerMocks.JOINER_WITH_ACCEPTED_CONFIG.copy());
    }));
    afterEach(fakeAsync(async() => {
        console.log("END");
        fixture.destroy();
        await fixture.whenStable();
        tick();
        console.log("DOUBLEND");
    }));
});
