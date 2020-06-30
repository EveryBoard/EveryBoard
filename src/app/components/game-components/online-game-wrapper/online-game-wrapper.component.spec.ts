import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { of } from 'rxjs';

import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { OnlineGameWrapperComponent } from './online-game-wrapper.component';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { JoinerService } from 'src/app/services/joiner/JoinerService';

import { JoinerDAO } from 'src/app/dao/joiner/JoinerDAO';
import { JoinerDAOMock } from 'src/app/dao/joiner/JoinerDAOMock';

import { IJoiner } from 'src/app/domain/ijoiner';
import { JoinerMocks } from 'src/app/domain/JoinerMocks';
import { PartDAO } from 'src/app/dao/part/PartDAO';
import { PartDAOMock } from 'src/app/dao/part/PartDAOMock';
import { PartMocks } from 'src/app/domain/PartMocks';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { ChatDAO } from 'src/app/dao/chat/ChatDAO';
import { ChatDAOMock } from 'src/app/dao/chat/ChatDAOMock';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                if (str === "id") return "joinerId";
                if (str === "compo") return "P4";
            },
        },
    },
}
class AuthenticationServiceMock {

    public static USER: {pseudo: string, verified: boolean};

    public getJoueurObs() {
        return of({
            pseudo: AuthenticationServiceMock.USER.pseudo,
            verified: AuthenticationServiceMock.USER.verified
        });
    }
    public getAuthenticatedUser(): {pseudo: string, verified: boolean} {
        return {
            pseudo: AuthenticationServiceMock.USER.pseudo,
            verified: AuthenticationServiceMock.USER.verified
        };
    }
};
class RouterMock {

    public async navigate(to: string[]): Promise<boolean> {
        return Promise.resolve(true);
    };
}
describe('OnlineGameWrapperComponent', () => {

    /* Life cycle summary
     * component construction (beforeEach)
     * stage 0
     * ngOnInit (triggered by detectChanges)
     * stage 1: PartCreationComponent appear
     * startGame, launched by user if game was not started yet, or automatically (via partCreationComponent)
     * stage 2: PartCreationComponent dissapear, GameIncluderComponent appear
     * tick(1): the async part of startGame is now finished
     * stage 3: P4Component appear
     * differents scenarios
     */

    let fixture: ComponentFixture<OnlineGameWrapperComponent>;

    let component: OnlineGameWrapperComponent;

    let joinerService: JoinerService;

    let prepareComponent: (initialJoiner: IJoiner) => Promise<void> = async(initialJoiner: IJoiner) => {
        fixture = TestBed.createComponent(OnlineGameWrapperComponent);
        let partDAOMock: PartDAOMock = TestBed.get(PartDAO);
        let joinerDAOMock: JoinerDAOMock = TestBed.get(JoinerDAO);
        let chatDAOMock: ChatDAOMock = TestBed.get(ChatDAO);
        joinerService = TestBed.get(JoinerService);
        component = fixture.debugElement.componentInstance;
        await joinerDAOMock.set("joinerId", initialJoiner);
        await partDAOMock.set("joinerId", PartMocks.INITIAL.copy());
        await chatDAOMock.set("joinerId", { messages: [], status: "I don't have a clue" });
        return Promise.resolve();
    }
    beforeAll(() => {
        OnlineGameWrapperComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || OnlineGameWrapperComponent.VERBOSE;
    });
    beforeEach(async(async() => {
        await TestBed.configureTestingModule({
            imports: [
                AppModule,
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            providers: [
                { provide: ActivatedRoute,        useValue: activatedRouteStub },
                { provide: JoinerDAO,             useClass: JoinerDAOMock },
                { provide: PartDAO,               useClass: PartDAOMock },
                { provide: JoueursDAO,            useClass: JoueursDAOMock },
                { provide: ChatDAO,               useClass: ChatDAOMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: Router,                useClass: RouterMock },
            ],
        }).compileComponents();
    }));
    it('Initialisation should lead to child component PartCreation to call JoinerService', fakeAsync(async() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        await prepareComponent(JoinerMocks.INITIAL.copy());
        const ngOnInitSpy: jasmine.Spy = spyOn(component, 'ngOnInit').and.callThrough();
        const joinGame: jasmine.Spy = spyOn(joinerService, 'joinGame').and.callThrough();
        const startObserving: jasmine.Spy = spyOn(joinerService, 'startObserving').and.callThrough();
        expect(ngOnInitSpy).not.toHaveBeenCalled();
        expect(joinGame).not.toHaveBeenCalled();
        expect(startObserving).not.toHaveBeenCalled();

        fixture.detectChanges();
        tick(1);
        
        expect(ngOnInitSpy).toHaveBeenCalledTimes(1);
        expect(joinGame).toHaveBeenCalledTimes(1);
        expect(startObserving).toHaveBeenCalledTimes(1);
        expect(component).toBeTruthy();
    }));
    it('Initialisation on accepted config should lead to PartCreationComponent to call startGame ', fakeAsync(async() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        await prepareComponent(JoinerMocks.WITH_ACCEPTED_CONFIG.copy());
        fixture.detectChanges();

        const startGame: jasmine.Spy = spyOn(component, 'startGame').and.callThrough();
        expect(startGame).not.toHaveBeenCalled();

        tick(); // Finish calling async code from PartCreationComponent initialisation

        expect(startGame).toHaveBeenCalledTimes(1);
        fixture.detectChanges(); // Needed so PartCreation is destroyed and GameIncluder Component created
        tick(1);
        tick(component.maximalMoveDuration);
    }));
    it('Some tags are needed before initialisation', fakeAsync(async() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        await prepareComponent(JoinerMocks.INITIAL.copy());
        expect(component).toBeTruthy();
        const compiled = fixture.debugElement.nativeElement;
        const partCreationTag = compiled.querySelector("app-part-creation");
        const gameIncluderTag = compiled.querySelector("app-game-includer");
        const p4Tag = compiled.querySelector("app-p4");
        const chatTag = compiled.querySelector("app-chat");

        expect(component.gameStarted).toBeFalsy("gameStarted should be false atstart");
        expect(partCreationTag).toBeFalsy("app-part-creation tag should be present at start");
        expect(gameIncluderTag).toBeFalsy("app-game-includer tag should be absent at start");
        expect(p4Tag).toBeFalsy("app-p4 tag should be absent at start");
        expect(chatTag).toBeTruthy("app-chat tag should be present at start");

        fixture.detectChanges();
        tick(1);
    }));
    it('Some ids are needed before initialisation', fakeAsync(async() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        await prepareComponent(JoinerMocks.INITIAL.copy());
        const partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        const gameId = fixture.debugElement.query(By.css('#game'));
        const chatId = fixture.debugElement.query(By.css('#chat'));

        expect(component.gameStarted).toBeFalsy("gameStarted should be false at start");
        expect(partCreationId).toBeFalsy("partCreation id should be present at start");
        expect(gameId).toBeFalsy("game id should be absent at start");
        expect(chatId).toBeTruthy("chat id should be present at start");

        fixture.detectChanges();
        tick(1);
    }));
    it('Initialisation should make appear PartCreationComponent', fakeAsync(async() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        await prepareComponent(JoinerMocks.INITIAL.copy());
        let partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        expect(partCreationId).toBeFalsy("partCreation id should be absent before ngOnInit");

        fixture.detectChanges();
        tick(1);

        partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        expect(partCreationId).toBeTruthy("partCreation id should be present after ngOnInit");
    }));
    it('StartGame should replace PartCreationComponent by GameIncluderComponent for creator', fakeAsync(async() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        await prepareComponent(JoinerMocks.WITH_ACCEPTED_CONFIG.copy());
        fixture.detectChanges();
        tick();
        
        fixture.detectChanges();
        
        const partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        const gameId = fixture.debugElement.query(By.css('#game'));
        const compiled = fixture.debugElement.nativeElement;
        const p4Tag = compiled.querySelector("app-p4");

        expect(component.gameStarted).toBeTruthy("gameStarted should be true after startGame call");
        expect(partCreationId).toBeFalsy("partCreation id should be absent after startGame call");
        expect(gameId).toBeTruthy("game id should be present after startGame call");
        expect(p4Tag).toBeNull("p4Tag id should still be absent after startGame call");
        tick(1);
        tick(component.maximalMoveDuration);
    }));
    it('StartGame should replace PartCreationComponent by GameIncluderComponent for chosenPlayer', fakeAsync(async() => {
        AuthenticationServiceMock.USER = { pseudo: "chosenPlayer", verified: true };
        await prepareComponent(JoinerMocks.WITH_ACCEPTED_CONFIG.copy());
        fixture.detectChanges();
        tick();
        
        fixture.detectChanges();

        const partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        const gameId = fixture.debugElement.query(By.css('#game'));
        const compiled = fixture.debugElement.nativeElement;
        const p4Tag = compiled.querySelector("app-p4");

        expect(component.gameStarted).toBeTruthy("gameStarted should be true after startGame call");
        expect(partCreationId).toBeFalsy("partCreation id should be absent after startGame call");
        expect(gameId).toBeTruthy("game id should be present after startGame call");
        expect(p4Tag).toBeNull("p4Tag id should still be absent after startGame call");
        tick(1);
        tick(component.maximalMoveDuration);
    }));
    it('stage three should make the game component appear at last', fakeAsync(async() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        await prepareComponent(JoinerMocks.WITH_ACCEPTED_CONFIG.copy());
        fixture.detectChanges();
        tick();
        
        fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.querySelector("app-p4")).toBeNull("p4Tag id should be absent before startGame's async method has complete");

        tick(1);

        expect(fixture.debugElement.nativeElement.querySelector("app-p4")).toBeTruthy("p4Tag id should be present after startGame's async method has complete");
        tick(component.maximalMoveDuration);
    }));
    afterEach(fakeAsync(async() => {
        fixture.destroy();
        await fixture.whenStable();
        tick();
    }));
});