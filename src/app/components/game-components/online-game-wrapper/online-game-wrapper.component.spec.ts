import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { of } from 'rxjs';

import { OnlineGameWrapperComponent } from './online-game-wrapper.component';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { GameService } from 'src/app/services/game/GameService';
import { UserService } from 'src/app/services/user/UserService';
import { JoinerService } from 'src/app/services/joiner/JoinerService';
import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { ActivatedRoute } from '@angular/router';
import { IChatId } from 'src/app/domain/ichat';
import { ChatService } from 'src/app/services/chat/ChatService';
import { By } from '@angular/platform-browser';
import { ICurrentPartId } from 'src/app/domain/icurrentpart';
import { JoinerServiceMock } from 'src/app/services/joiner/JoinerServiceMock';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                if (str === "id") return "fakeId";
                if (str === "compo") return "P4";
            },
        },
    },
}
class GameServiceMock {

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

    public getActivesPartsObs() {
        return of([]);
    }
    public stopObserving() {
        return;
    }
    public startObserving(partId: string, callback: (iPart: ICurrentPartId) => void) {
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
    public notifyTimeout(partId: string, winner: string): Promise<void> {
        return new Promise(resolve => { resolve(); });
    }
}
const userServiceStub = {

    getActivesUsersObs: () => of([]),
};
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: 'Pseudo', verified: true}),

    getAuthenticatedUser: () => { return { pseudo: 'Pseudo', verified: true}; },
};
class ChatServiceMock {

    public startObserving(cId: string, cb: (iChatId: IChatId) => void) {
    };
    public stopObserving() {
    };
    public isObserving(): boolean {
        return;
    }
};
describe('OnlineGameWrapperComponent', () => {
    
    /* Life cycle summary
     * component construction (beforeEach)
     * stage 0
     * ngOnInit (triggered by detectChanges)
     * stage 1: PartCreationComponent and Chat
     * startGame, launched by user (via partCreationComponent)
     * stage 2: PartCreationComponent dissapear, GameIncluderComponent appear
     * tick(1): the async part of startGame is now finished
     * stage 3: P4Component appear
     * differents scenarios
     */

    let fixture: ComponentFixture<OnlineGameWrapperComponent>;

    let component: OnlineGameWrapperComponent;

    beforeAll(() => {
        OnlineGameWrapperComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
    });
    beforeEach(async(async () => {
        await TestBed.configureTestingModule({
            imports: [
                AppModule,
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: GameService, useClass: GameServiceMock },
                { provide: UserService, useValue: userServiceStub },
                { provide: JoinerService, useClass: JoinerServiceMock },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
                { provide: ChatService, useClass: ChatServiceMock },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(OnlineGameWrapperComponent);
        component = fixture.debugElement.componentInstance;
    }));
    it('should have healthy lifecycle', async(() => {
        GameServiceMock.emittedsGame = [ GameServiceMock.CURRENT_PARTS.INITIAL_PART ];
        JoinerServiceMock.emittedsJoiner = [ JoinerServiceMock.JOINERS.JOINER_INITIAL ];
        const ngOnInitSpy: jasmine.Spy = spyOn(component, 'ngOnInit').and.callThrough();
        expect(ngOnInitSpy).not.toHaveBeenCalled();

        fixture.detectChanges();

        expect(ngOnInitSpy).toHaveBeenCalledTimes(1);
    }));
    it('stage zero should create needed tags', async(() => {
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
    }));
    it('stage zero should create needed ids', async(() => {
        const partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        const gameId = fixture.debugElement.query(By.css('#game'));
        const chatId = fixture.debugElement.query(By.css('#chat'));

        expect(component.gameStarted).toBeFalsy("gameStarted should be false at start");
        expect(partCreationId).toBeFalsy("partCreation id should be present at start");
        expect(gameId).toBeFalsy("game id should be absent at start");
        expect(chatId).toBeTruthy("chat id should be present at start");
    }));
    it('stage two should create needed tags and ids', fakeAsync(() => {
        GameServiceMock.emittedsGame = [ GameServiceMock.CURRENT_PARTS.INITIAL_PART ];
        component.startGame();
        fixture.detectChanges();

        const partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        const gameId = fixture.debugElement.query(By.css('#game'));
        const chatId = fixture.debugElement.query(By.css('#chat'));
        const compiled = fixture.debugElement.nativeElement;
        const countDownTag = compiled.querySelector("app-count-down");
        const p4Tag = compiled.querySelector("app-p4");

        expect(component.gameStarted).toBeTruthy("gameStarted should be true after startGame call");
        expect(partCreationId).toBeFalsy("partCreation id should be absent after startGame call");
        expect(gameId).toBeTruthy("game id should be present after startGame call");
        expect(chatId).toBeTruthy("chat id should be present after startGame call");
        expect(p4Tag).toBeNull("p4Tag id should still be absent after startGame call");
        expect(countDownTag).toBeTruthy("app-count-down tag should be present after startGame call");
        tick(300000 + 1);
    }));
    it('stage three should make the game component appear at last', fakeAsync(() => {
        GameServiceMock.emittedsGame = [ GameServiceMock.CURRENT_PARTS.INITIAL_PART ];
        component.startGame();
        fixture.detectChanges();
        tick(1);
        fixture.detectChanges();

        const compiled = fixture.debugElement.nativeElement;
        const p4Tag = compiled.querySelector("app-p4");
        expect(p4Tag).toBeTruthy("p4Tag id should be present after startGame's async method has complete");

        tick(300000);
    }));
    afterEach(async(() => {
        component.ngOnDestroy();
    }));
});