import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { of, Observable } from 'rxjs';

import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { OnlineGameWrapperComponent } from './online-game-wrapper.component';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { GameService } from 'src/app/services/game/GameService';
import { UserService } from 'src/app/services/user/UserService';
import { JoinerService } from 'src/app/services/joiner/JoinerService';
import { ChatService } from 'src/app/services/chat/ChatService';

import { JoinerDAO } from 'src/app/dao/joiner/JoinerDAO';
import { JoinerDAOMock } from 'src/app/dao/joiner/JoinerDAOMock';

import { IChatId } from 'src/app/domain/ichat';
import { ICurrentPartId } from 'src/app/domain/icurrentpart';
import { IJoueurId } from 'src/app/domain/iuser';
import { IJoiner } from 'src/app/domain/ijoiner';
import { JoinerMocks } from 'src/app/domain/JoinerMocks';

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
class GameServiceMock {

    public static VERBOSE: boolean = true;

    public static CURRENT_PARTS = {
        INITIAL_PART: {
            id: 'joinerId',
            doc: {
                typeGame: 'P4',
                playerZero: 'creator',
                turn: 0,
                result: 5,
                listMoves: [],
            }
        }
    };
    public static emittedsGame: ICurrentPartId[];

    public getActivesPartsObs(): Observable<ICurrentPartId[]> {
        if (GameServiceMock.VERBOSE) console.log("GameServiceMock.getActivesPartsObs");
        return of([]);
    }
    public stopObserving() {
        if (GameServiceMock.VERBOSE) console.log("GameServiceMock.stopObserving");
    }
    public startObserving(partId: string, callback: (iPart: ICurrentPartId) => void) {
        if (GameServiceMock.VERBOSE) console.log("GameServiceMock.startObserving(" + partId + ")");
        let i: number = 0;
        while (i<GameServiceMock.emittedsGame.length) {
            setTimeout(
                (index: number) => callback(GameServiceMock.emittedsGame[index]),
                1000*(i+1),
                i
            );
            i++;
        }
    }
    public async notifyTimeout(partId: string, winner: string): Promise<void> {
        if (GameServiceMock.VERBOSE) console.log("GameServiceMock.notifyTimeout(" + partId + ", " + winner + ")");
        return;
    }
    public async deletePart(partId: string): Promise<void> {
        if (GameServiceMock.VERBOSE) console.log("GameServiceMock.deletePart(" + partId + ")");
        return;
    }
}
class UserServiceMock {

    public getActivesUsersObs(): Observable<IJoueurId[]> {
        return of([]);
    }
};
class AuthenticationServiceMock {

    public static USER: {pseudo: string, verified: boolean};

    public constructor() {
        console.log("AuthenticationServiceMock.constructor: " + JSON.stringify(AuthenticationServiceMock.USER));
    }
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
class ChatServiceMock {

    public startObserving(cId: string, cb: (iChatId: IChatId) => void) {
    };
    public stopObserving() {
    };
    public isObserving(): boolean {
        return;
    }
    public async deleteChat(chatId: string): Promise<void> {
        return;
    }
};
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

    let prepareComponent: (initialJoiner: IJoiner) => void = async(initialJoiner: IJoiner) => {
        fixture = TestBed.createComponent(OnlineGameWrapperComponent);
        joinerService = TestBed.get(JoinerService);
        component = fixture.debugElement.componentInstance;
        // GameServiceMock.emittedsGame = null;
        await JoinerDAOMock.set("joinerId", initialJoiner);
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
                { provide: GameService,           useClass: GameServiceMock },
                { provide: UserService,           useValue: UserServiceMock },
                { provide: JoinerDAO,             useClass: JoinerDAOMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: ChatService,           useClass: ChatServiceMock },
            ],
        }).compileComponents();
        GameServiceMock.emittedsGame = null;
    }));
    it('Initialisation should lead to child component PartCreation to call JoinerService', fakeAsync(() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        prepareComponent(JoinerMocks.JOINER_INITIAL.copy());
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
    it('Some tags are needed before initialisation', fakeAsync(() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        prepareComponent(JoinerMocks.JOINER_INITIAL.copy());
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
    it('Some ids are needed before initialisation', fakeAsync(() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        prepareComponent(JoinerMocks.JOINER_INITIAL.copy());
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
    it('Initialisation should make appear PartCreationComponent', fakeAsync(() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        prepareComponent(JoinerMocks.JOINER_INITIAL.copy());
        let partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        expect(partCreationId).toBeFalsy("partCreation id should be absent before ngOnInit");

        fixture.detectChanges();
        tick(1);

        partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        expect(partCreationId).toBeTruthy("partCreation id should be present after ngOnInit");
    }));
    it('StartGame should replace PartCreationComponent by GameIncluderComponent for creator', fakeAsync(async() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        GameServiceMock.emittedsGame = [ GameServiceMock.CURRENT_PARTS.INITIAL_PART ];
        prepareComponent(JoinerMocks.JOINER_WITH_ACCEPTED_CONFIG.copy());
        console.log("stage 0: about to ngOnInit via detectChanges");
        fixture.detectChanges();
        console.log("about to whenStable");
        await fixture.whenStable();
        
        console.log("stage 1: about to startGame");
        component.startGame();
        
        console.log("must we detectChanges");
        fixture.detectChanges();

        const partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        const gameId = fixture.debugElement.query(By.css('#game'));
        const compiled = fixture.debugElement.nativeElement;
        const p4Tag = compiled.querySelector("app-p4");

        expect(component.gameStarted).toBeTruthy("gameStarted should be true after startGame call");
        expect(partCreationId).toBeFalsy("partCreation id should be absent after startGame call");
        expect(gameId).toBeTruthy("game id should be present after startGame call");
        expect(p4Tag).toBeNull("p4Tag id should still be absent after startGame call");
        tick(300000 + 1);
    }));
    it('StartGame should replace PartCreationComponent by GameIncluderComponent for chosenPlayer', fakeAsync(() => {
        AuthenticationServiceMock.USER = { pseudo: "chosenPlayer", verified: true };
        GameServiceMock.emittedsGame = [ GameServiceMock.CURRENT_PARTS.INITIAL_PART ];
        prepareComponent(JoinerMocks.JOINER_INITIAL.copy());
        console.log("stage 0: about to ngOnInit via detectChanges");
        fixture.detectChanges();
        tick(10); // to be sure TODO: tick()
        
        console.log("stage 1: about to startGame");
        component.startGame();
        
        console.log("must we detectChanges");
        fixture.detectChanges();

        const partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        const gameId = fixture.debugElement.query(By.css('#game'));
        const compiled = fixture.debugElement.nativeElement;
        const p4Tag = compiled.querySelector("app-p4");

        expect(component.gameStarted).toBeTruthy("gameStarted should be true after startGame call");
        expect(partCreationId).toBeFalsy("partCreation id should be absent after startGame call");
        expect(gameId).toBeTruthy("game id should be present after startGame call");
        expect(p4Tag).toBeNull("p4Tag id should still be absent after startGame call");
        tick(300000 + 1);
    }));
    it('ChosenPlayer should be able to acceptConfig', fakeAsync(() => {
        AuthenticationServiceMock.USER = { pseudo: "chosenPlayer", verified: true };
        prepareComponent(JoinerMocks.JOINER_INITIAL.copy());
        fixture.detectChanges();
        // check that we first receive [a joiner without us then] a joiner with us.
        tick(1);
        // check when selected that we can accept config, that we see the button, and that it lead to P4Tag apparition

        expect(false).toBeTruthy();
    }));
    it('stage three should make the game component appear at last', fakeAsync(() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        prepareComponent(JoinerMocks.JOINER_INITIAL.copy());
        GameServiceMock.emittedsGame = [ GameServiceMock.CURRENT_PARTS.INITIAL_PART ];
        fixture.detectChanges();
        tick(1);
        component.startGame();
        fixture.detectChanges();

        const compiled = fixture.debugElement.nativeElement;
        const p4Tag = compiled.querySelector("app-p4");
        expect(p4Tag).toBeTruthy("p4Tag id should be present after startGame's async method has complete");

        tick(300000);
    }));
    afterEach(async(async() => {
        fixture.destroy();
        await fixture.whenStable();
    }));
});