import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { of } from 'rxjs';

import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { OnlineGameWrapperComponent } from './online-game-wrapper.component';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';

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
import { QuartoMove } from 'src/app/games/quarto/quartomove/QuartoMove';
import { QuartoPartSlice } from 'src/app/games/quarto/QuartoPartSlice';
import { By } from '@angular/platform-browser';
import { QuartoComponent } from '../quarto/quarto.component';
import { QuartoEnum } from 'src/app/games/quarto/QuartoEnum';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                if (str === "id") return "joinerId";
                if (str === "compo") return "Quarto";
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
};
describe('OnlineGameWrapperComponent of Quarto', () => {

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

    let joinerDAO: JoinerDAOMock;

    let partDAO: PartDAOMock;

    let prepareComponent: (initialJoiner: IJoiner) => Promise<void> = async(initialJoiner: IJoiner) => {
        fixture = TestBed.createComponent(OnlineGameWrapperComponent);
        partDAO = TestBed.get(PartDAO);
        joinerDAO = TestBed.get(JoinerDAO);
        let chatDAOMock: ChatDAOMock = TestBed.get(ChatDAO);
        component = fixture.debugElement.componentInstance;
        await joinerDAO.set("joinerId", initialJoiner);
        await partDAO.set("joinerId", PartMocks.INITIAL.copy());
        await chatDAOMock.set("joinerId", { messages: [], status: "I don't have a clue" });
        return Promise.resolve();
    }
    let prepareStartedGameForCreator: () => Promise<void> = async() => {
        AuthenticationServiceMock.USER = { pseudo: "creator", verified: true };
        await prepareComponent(JoinerMocks.INITIAL.copy());
        fixture.detectChanges();
        tick(1);

        let partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        expect(partCreationId).toBeTruthy("partCreation id should be present after ngOnInit");
        expect(component.partCreation).toBeTruthy("partCreation field should also be present");
        await joinerDAO.update("joinerId", { candidatesNames : ["firstCandidate"] });
        fixture.detectChanges();
        await fixture.whenStable();
        await joinerDAO.update("joinerId",
                               { partStatus: 1, candidatesNames : [], chosenPlayer: "firstCandidate"});
        // TODO: replace by real actor action (chooseCandidate)
        fixture.detectChanges();
        await component.partCreation.proposeConfig();
        fixture.detectChanges();
        await joinerDAO.update("joinerId", { partStatus: 3});
        await partDAO.update("joinerId", { playerOne: "firstCandidate", turn: 0, beginning: Date.now() });
        return Promise.resolve();
    };
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

    it('Should be able to prepare a started game for creator', fakeAsync(async() => {
        await prepareStartedGameForCreator();
        fixture.detectChanges();
        tick(1);
        tick(component.maximalMoveDuration);
    }));

    it('Prepared Game for creator should no longer have PartCreationComponent and QuartoComponent instead', fakeAsync(async() => {
        await prepareStartedGameForCreator();
        fixture.detectChanges();

        const partCreationId = fixture.debugElement.query(By.css('#partCreation'));
        let quartoTag = fixture.debugElement.nativeElement.querySelector("app-quarto");
        expect(partCreationId).toBeFalsy("partCreation id should be absent after config accepted");
        expect(quartoTag).toBeFalsy("quarto tag should be absent before config accepted and async millisec finished");
        expect(component.partCreation).toBeFalsy("partCreation field should also be absent after config accepted");
        expect(component.gameComponent).toBeFalsy("gameComponent field should also be absent after config accepted and async millisec finished");

        tick(1);

        quartoTag = fixture.debugElement.nativeElement.querySelector("app-quarto");
        expect(quartoTag).toBeTruthy("quarto tag should be present after config accepted and async millisec finished");
        expect(component.gameComponent).toBeTruthy("gameComponent field should also be present after config accepted and async millisec finished");
        tick(component.maximalMoveDuration);
    }));

    it('Prepared Game for creator should allow simple move', fakeAsync(async() => {
        await prepareStartedGameForCreator();
        fixture.detectChanges();
        tick(1);

        expect(component.currentPart.copy().listMoves).toEqual([]);
        let slice: QuartoPartSlice = component.gameComponent.rules.node.gamePartSlice as QuartoPartSlice;
        const chosenMove: QuartoMove = new QuartoMove(0, 3, 11);
        const legalFirst: boolean = await component.gameComponent.chooseMove(chosenMove, slice, null, null);
        expect(legalFirst).toBeTruthy("First movement should be legal");

        expect(component.currentPart.copy().listMoves).toEqual([107]);
        expect(component.currentPart.copy().turn).toEqual(1);
        await partDAO.update("joinerId", { listMoves: [107, 166], turn: 2 });
        fixture.detectChanges();

        expect(component.currentPart.copy().turn).toEqual(2);
        expect(component.currentPart.copy().listMoves).toEqual([107, 166]);
        slice = component.gameComponent.rules.node.gamePartSlice as QuartoPartSlice;
        let legalThird: boolean = await component.gameComponent.chooseMove(new QuartoMove(0, 2, 5), slice, null, null);
        expect(legalThird).toBeTruthy("Third movement should be legal");

        expect(component.currentPart.copy().listMoves).toEqual([107, 166, 69]);
        tick(component.maximalMoveDuration);
    }));

    it('Move should trigger db change', fakeAsync(async() => {
        await prepareStartedGameForCreator();
        fixture.detectChanges();
        tick(1);
        expect(component.currentPart.copy().listMoves).toEqual([]);
        spyOn(partDAO, "update").and.callThrough();
        expect(partDAO.update).not.toHaveBeenCalled();

        let slice: QuartoPartSlice = component.gameComponent.rules.node.gamePartSlice as QuartoPartSlice;
        const chosenMove: QuartoMove = new QuartoMove(0, 3, 11);
        const legalFirst: boolean = await component.gameComponent.chooseMove(chosenMove, slice, null, null);
        expect(legalFirst).toBeTruthy("First movement should be legal");

        expect(component.currentPart.copy().listMoves).toEqual([chosenMove.encode()]);
        const expectedUpdate = {
            listMoves: [ chosenMove.encode() ], turn: 1,
            scorePlayerZero: null,              scorePlayerOne: null
        };
        expect(partDAO.update).toHaveBeenCalledWith("joinerId", expectedUpdate );
        tick(component.maximalMoveDuration);
    }));

    it('Victory move from player should notifyVictory', fakeAsync(async() => {
        await prepareStartedGameForCreator();
        fixture.detectChanges();
        tick(1);

        let slice: QuartoPartSlice = component.gameComponent.rules.node.gamePartSlice as QuartoPartSlice;
        const move0: QuartoMove = new QuartoMove(0, 3, QuartoEnum.AAAB);
        const move1: QuartoMove = new QuartoMove(1, 3, QuartoEnum.AABA);
        const move2: QuartoMove = new QuartoMove(2, 3, QuartoEnum.BBBB);
        const move3: QuartoMove = new QuartoMove(0, 0, QuartoEnum.AABB);
        const winningMove: QuartoMove = new QuartoMove(3, 3, QuartoEnum.ABAA);
        await component.gameComponent.chooseMove(move0, slice, null, null);
        await partDAO.update("joinerId", {
            listMoves: [move0.encode(), move1.encode()], turn : 2,
            scorePlayerZero: null,                       scorePlayerOne: null
        });
        await component.gameComponent.chooseMove(move2, slice, null, null);
        await partDAO.update("joinerId", {
            listMoves: [move0.encode(), move1.encode(), move2.encode(), move3.encode()], turn : 4,
            scorePlayerZero: null,              scorePlayerOne: null
        });
        tick();
        fixture.detectChanges();

        spyOn(partDAO, 'update').and.callThrough();
        await component.gameComponent.chooseMove(winningMove, slice, null, null);

        expect(component.gameComponent.rules.node.move.toString()).toBe(winningMove.toString());
        expect(partDAO.update).toHaveBeenCalledTimes(2);
        expect(partDAO.update).toHaveBeenCalledWith("joinerId", {
            listMoves: [move0.encode(), move1.encode(), move2.encode(), move3.encode(), winningMove.encode()],
            turn: 5, scorePlayerZero: null, scorePlayerOne: null
        });
        expect(partDAO.update).toHaveBeenCalledWith("joinerId", {
            winner: 'creator',
            result: 3,
            request: null
        });
    }));

    afterEach(fakeAsync(async() => {
        fixture.destroy();
        await fixture.whenStable();
        tick();
    }));
});