import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from 'src/app/app.module';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { UserDAO } from 'src/app/dao/UserDAO';
import { PartDAO } from 'src/app/dao/PartDAO';
import { ChatDAOMock } from 'src/app/dao/tests/ChatDAOMock.spec';
import { JoinerDAOMock } from 'src/app/dao/tests/JoinerDAOMock.spec';
import { UserDAOMock } from 'src/app/dao/tests/UserDAOMock.spec';
import { PartDAOMock } from 'src/app/dao/tests/PartDAOMock.spec';
import { DiamPiece } from 'src/app/games/diam/DiamPiece';
import { EncapsulePiece } from 'src/app/games/encapsule/EncapsulePiece';
import { Direction } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ActivatedRouteStub } from 'src/app/utils/tests/TestUtils.spec';
import { GameInfo, PickGameComponent } from '../../normal-component/pick-game/pick-game.component';
import { GameWrapperMessages } from '../../wrapper-components/GameWrapper';
import { LocalGameWrapperComponent } from '../../wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { AbstractGameComponent } from './GameComponent';
import { Utils } from 'src/app/utils/utils';

describe('GameComponent', () => {

    const activatedRouteStub: ActivatedRouteStub = new ActivatedRouteStub();

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let component: LocalGameWrapperComponent;

    const gameList: ReadonlyArray<string> = new PickGameComponent().gameNameList;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [
                AppModule,
                RouterTestingModule.withRoutes([
                    { path: 'local', component: LocalGameWrapperComponent }]),
            ],
            declarations: [
                LocalGameWrapperComponent,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: PartDAO, useClass: PartDAOMock },
                { provide: JoinerDAO, useClass: JoinerDAOMock },
                { provide: ChatDAO, useClass: ChatDAOMock },
                { provide: UserDAO, useClass: UserDAOMock },
                { provide: ActivatedRoute, useValue: activatedRouteStub },
            ],
        }).compileComponents();
        AuthenticationServiceMock.setUser(AuthUser.NOT_CONNECTED);
    }));
    it('should fail if pass() is called on a game that does not support it', fakeAsync(async() => {
        spyOn(Utils, 'handleError').and.returnValue(null);
        // given such a game, like Abalone
        activatedRouteStub.setRoute('compo', 'Abalone');
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        component = fixture.debugElement.componentInstance;
        component.observerRole = 1;
        fixture.detectChanges();
        tick(1);
        expect(component.gameComponent).toBeDefined();

        // when we try to pass
        const result: MGPValidation = await component.gameComponent.pass();

        // then it gives an error and handleError is called
        const error: string = 'GameComponent.pass() called on a game that does not redefine it';
        expect(result.isFailure()).toBeTrue();
        expect(result.getReason()).toEqual(error);
        expect(Utils.handleError).toHaveBeenCalledWith(error);
    }));
    it('Clicks method should refuse when observer click', fakeAsync(async() => {
        const clickableMethods: { [gameName: string]: { [methodName: string]: unknown[] } } = {
            Abalone: {
                onPieceClick: [0, 0],
                onCaseClick: [0, 0],
                chooseDirection: [Direction.UP],
            },
            Apagos: {
                onSquareClick: [0],
                onArrowClick: [0, Player.ONE],
            },
            Awale: { onClick: [0, 0] },
            Brandhub: { onClick: [0, 0] },
            Coerceo: { onClick: [0, 0] },
            Diam: {
                onSpaceClick: [0],
                onPieceInGameClick: [0, 0],
                onRemainingPieceClick: [DiamPiece.ZERO_FIRST],
            },
            Dvonn: { onClick: [0, 0] },
            Encapsule: {
                onBoardClick: [0, 0],
                onPieceClick: [0, EncapsulePiece.BIG_WHITE, 0],
            },
            Epaminondas: { onClick: [0, 0] },
            Gipf: { onClick: [0, 0] },
            Go: { onClick: [0, 0] },
            Kamisado: { onClick: [0, 0] },
            LinesOfAction: { onClick: [0, 0] },
            MinimaxTesting: {
                chooseRight: [],
                chooseDown: [],
            },
            P4: { onClick: [0, 0] },
            Pentago: {
                onClick: [0, 0],
                rotate: [['not relevant', 0, true]],
                skipRotation: [],
            },
            Pylos: {
                onPieceClick: [0, 0, 0],
                onDrop: [0, 0, 0],
            },
            Quarto: {
                chooseCoord: [0, 0],
                choosePiece: [0],
            },
            Quixo: {
                onBoardClick: [0, 0],
                chooseDirection: [0],
            },
            Reversi: { onClick: [0, 0] },
            Sahara: { onClick: [0, 0] },
            Siam: {
                insertAt: [0, 0],
                clickPiece: [0, 0],
                chooseDirection: [0],
                chooseOrientation: [0],
            },
            Six: {
                onPieceClick: [0, 0],
                onNeighborClick: [0, 0],
            },
            Tablut: { onClick: [0, 0] },
            Yinsh: { onClick: [0, 0] },
        };
        const refusal: MGPValidation = MGPValidation.failure(GameWrapperMessages.NO_CLONING_FEATURE());

        for (const gameName of gameList.concat('MinimaxTesting')) {
            const game: { [methodName: string]: unknown[] } = clickableMethods[gameName];
            if (game == null) {
                throw new Error('Please define ' + gameName + ' clickable method in here to test them.');
            }
            activatedRouteStub.setRoute('compo', gameName);
            fixture = TestBed.createComponent(LocalGameWrapperComponent);
            component = fixture.debugElement.componentInstance;
            component.observerRole = 2;
            fixture.detectChanges();
            tick(1);
            expect(component.gameComponent).toBeDefined();
            for (const methodName of Object.keys(game)) {
                expect(component.gameComponent[methodName]).withContext(`click method ${methodName} should be defined for game ${gameName}`).toBeDefined();
                const clickResult: MGPValidation = await component.gameComponent[methodName](...game[methodName]);
                expect(clickResult).toEqual(refusal);
            }
        }
        tick(3000); // needs to be >2999
    }));
    it('Component should have an encoder and a tutorial', fakeAsync(async() =>{
        for (const gameInfo of GameInfo.ALL_GAMES()) {
            if (gameInfo.display === false) {
                continue;
            }
            const gameComponent: AbstractGameComponent =
                TestBed.createComponent(gameInfo.component).debugElement.componentInstance;
            expect(gameComponent.encoder).withContext('Encoder missing for ' + gameInfo.urlName).toBeTruthy();
            expect(gameComponent.tutorial).withContext('tutorial missing for ' + gameInfo.urlName).toBeTruthy();
            expect(gameComponent.tutorial.length).withContext('tutorial empty for ' + gameInfo.urlName).toBeGreaterThan(0);
        }
    }));
});
