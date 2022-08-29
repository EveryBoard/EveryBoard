/* eslint-disable max-lines-per-function */
import { fakeAsync, tick } from '@angular/core/testing';
import { DiamPiece } from 'src/app/games/diam/DiamPiece';
import { EncapsulePiece } from 'src/app/games/encapsule/EncapsulePiece';
import { Direction } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ActivatedRouteStub, ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { GameWrapperMessages } from '../../wrapper-components/GameWrapper';
import { AbstractGameComponent } from './GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { AbaloneComponent } from 'src/app/games/abalone/abalone.component';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { JSONValue } from 'src/app/utils/utils';

describe('GameComponent', () => {

    const activatedRouteStub: ActivatedRouteStub = new ActivatedRouteStub();

    beforeEach(fakeAsync(async() => {
        await ComponentTestUtils.configureTestModule(activatedRouteStub);
    }));
    it('should fail if pass() is called on a game that does not support it', fakeAsync(async() => {
        // given such a game, like Abalone
        activatedRouteStub.setRoute('compo', 'Abalone');
        const testUtils: ComponentTestUtils<AbaloneComponent> = await ComponentTestUtils.forGame('Abalone');
        const component: AbstractGameComponent = testUtils.getComponent();
        expect(component).toBeDefined();
        testUtils.wrapper.observerRole = Player.ONE;
        testUtils.detectChanges();
        tick(1);

        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

        // when the player tries to pass
        const result: MGPValidation = await component.pass();

        // then should fail and call logError
        const errorMessage: string = 'pass() called on a game that does not redefine it';
        const errorData: JSONValue = { gameName: 'AbaloneComponent' };
        expect(result.isFailure()).toBeTrue();
        expect(result.getReason()).toEqual('GameComponent: ' + errorMessage);
        expect(ErrorLoggerService.logError).toHaveBeenCalledWith('GameComponent', errorMessage, errorData);
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
            Conspirateurs: { onClick: [new Coord(0, 0)] },
            Diam: {
                onSpaceClick: [0],
                onPieceInGameClick: [0, 0],
                onRemainingPieceClick: [DiamPiece.ZERO_FIRST],
            },
            Dvonn: { onClick: [0, 0] },
            Encapsule: {
                onBoardClick: [0, 0],
                onPieceClick: [0, EncapsulePiece.BIG_LIGHT, 0],
            },
            Epaminondas: { onClick: [0, 0] },
            Gipf: { onClick: [0, 0] },
            Go: { onClick: [0, 0] },
            Kamisado: { onClick: [0, 0] },
            LinesOfAction: { onClick: [0, 0] },
            Lodestone: {
                selectCoord: [new Coord(0, 0)],
                selectLodestone: ['push', false],
                selectPressurePlate: ['top', 1],
                deselectPressurePlate: ['top', 1],
            },
            MartianChess: {
                onClick: [0, 0],
                onClockClick: [],
            },
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
        for (const gameInfo of GameInfo.ALL_GAMES()) {
            const game: { [methodName: string]: unknown[] } | undefined = clickableMethods[gameInfo.urlName];
            if (game == null) {
                throw new Error('Please define ' + gameInfo.urlName + ' clickable method in here to test them.');
            }
            activatedRouteStub.setRoute('compo', gameInfo.urlName);
            const testUtils: ComponentTestUtils<AbstractGameComponent> =
                await ComponentTestUtils.forGame(gameInfo.urlName, false);
            const component: AbstractGameComponent = testUtils.getComponent();
            testUtils.wrapper.observerRole = PlayerOrNone.NONE;
            testUtils.detectChanges();
            tick(1);
            expect(component).toBeDefined();
            for (const methodName of Object.keys(game)) {
                const context: string = `click method ${methodName} should be defined for game ${gameInfo.name}`;
                expect(component[methodName]).withContext(context).toBeDefined();
                const clickResult: MGPValidation = await component[methodName](...game[methodName]);
                expect(clickResult).toEqual(refusal);
            }
        }
        tick(3000); // needs to be >2999
    }));
    it('should have an encoder and a tutorial for every game', fakeAsync(async() =>{
        for (const gameInfo of GameInfo.ALL_GAMES()) {
            // Given a displayable game
            if (gameInfo.display === false) {
                continue;
            }
            activatedRouteStub.setRoute('compo', gameInfo.urlName);
            const testUtils: ComponentTestUtils<AbstractGameComponent> =
                await ComponentTestUtils.forGame(gameInfo.urlName, false);

            // When displaying the game
            const component: AbstractGameComponent = testUtils.getComponent();
            testUtils.detectChanges();
            tick(1);

            // Then it should have an encoder and a non-empty tutorial
            expect(component.encoder).withContext('Encoder missing for ' + gameInfo.urlName).toBeTruthy();
            expect(component.tutorial).withContext('tutorial missing for ' + gameInfo.urlName).toBeTruthy();
            expect(component.tutorial.length).withContext('tutorial empty for ' + gameInfo.urlName).toBeGreaterThan(0);
        }
    }));
});
