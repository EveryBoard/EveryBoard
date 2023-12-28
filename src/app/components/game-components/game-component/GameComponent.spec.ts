/* eslint-disable max-lines-per-function */
import { fakeAsync, tick } from '@angular/core/testing';
import { DiamPiece } from 'src/app/games/diam/DiamPiece';
import { EncapsulePiece } from 'src/app/games/encapsule/EncapsulePiece';
import { Direction, Orthogonal } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ActivatedRouteStub, ComponentTestUtils, TestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { GameWrapperMessages } from '../../wrapper-components/GameWrapper';
import { AbstractGameComponent } from './GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { AbaloneComponent } from 'src/app/games/abalone/abalone.component';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { JSONValue } from 'src/app/utils/utils';
import { SiamMove } from 'src/app/games/siam/SiamMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { HivePiece } from 'src/app/games/hive/HivePiece';

describe('GameComponent', () => {

    const activatedRouteStub: ActivatedRouteStub = new ActivatedRouteStub();

    beforeEach(fakeAsync(async() => {
        await TestUtils.configureTestingModuleForGame(activatedRouteStub);
    }));

    it('should fail if pass() is called on a game that does not support it', fakeAsync(async() => {
        // Given such a game, like Abalone
        activatedRouteStub.setRoute('compo', 'Abalone');
        const testUtils: ComponentTestUtils<AbaloneComponent> = await ComponentTestUtils.forGame('Abalone', false);
        const component: AbstractGameComponent = testUtils.getGameComponent();
        expect(component).toBeDefined();
        testUtils.getWrapper().role = Player.ONE;
        testUtils.detectChanges();
        tick(0);

        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

        // When the player tries to pass
        const result: MGPValidation = await component.pass();

        // Then should fail and call logError
        const errorMessage: string = 'pass() called on a game that does not redefine it';
        const errorData: JSONValue = { gameName: 'AbaloneComponent' };
        expect(result.isFailure()).toBeTrue();
        expect(result.getReason()).toEqual('GameComponent: ' + errorMessage);
        expect(ErrorLoggerService.logError).toHaveBeenCalledWith('GameComponent', errorMessage, errorData);
    }));

    const clickableMethods: { [gameName: string]: { [methodName: string]: unknown[] } } = {
        Abalone: {
            onPieceClick: [0, 0],
            onSpaceClick: [0, 0],
            chooseDirection: [Direction.UP],
        },
        Apagos: {
            onSquareClick: [0],
            onArrowClick: [0, Player.ONE],
        },
        Awale: { onClick: [0, 0] },
        BaAwa: { onClick: [0, 0] },
        Brandhub: { onClick: [0, 0] },
        Coerceo: { onClick: [0, 0] },
        ConnectSix: { onClick: [0, 0] },
        Conspirateurs: { onClick: [new Coord(0, 0)] },
        Diaballik: {
            onClick: [0, 0],
            done: [],
        },
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
        Hive: {
            selectSpace: [new Coord(0, 0), 'space'],
            selectRemaining: [new HivePiece(Player.ZERO, 'QueenBee')],
        },
        Hnefatafl: { onClick: [0, 0] },
        Kalah: {
            onClick: [0, 0],
            onStoreClick: [0],
        },
        Kamisado: { onClick: [0, 0] },
        Lasca: { onClick: [0, 0] },
        LinesOfAction: { onClick: [0, 0] },
        Lodestone: {
            selectCoord: [new Coord(0, 0)],
            selectLodestone: ['push', false],
            onTemporaryPressurePlateClick: ['top', 1, 1],
            onPressurePlateClick: ['top', 1, 1],
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
        Pente: {
            onClick: [0, 0],
        },
        Pylos: {
            onPieceClick: [0, 0, 0],
            onDrop: [0, 0, 0],
            validateCapture: [],
        },
        Quarto: {
            chooseCoord: [0, 0],
            choosePiece: [0],
            deselectDroppedPiece: [],
        },
        Quixo: {
            onBoardClick: [0, 0],
            chooseDirection: [0],
        },
        Reversi: { onClick: [0, 0] },
        Sahara: { onClick: [0, 0] },
        Siam: {
            selectPieceForInsertion: [Player.ZERO, 0],
            selectOrientation: [SiamMove.of(0, 0, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN)],
            clickSquare: [0, 0],
            clickArrow: [{
                source: MGPOptional.empty(),
                target: new Coord(0, 0),
                direction: Orthogonal.DOWN,
                move: SiamMove.of(0, 0, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN),
            }],
        },
        Six: {
            onPieceClick: [0, 0],
            onNeighborClick: [0, 0],
        },
        Tablut: { onClick: [0, 0] },
        Teeko: { onClick: [0, 0] },
        Trexo: {
            onClick: [0, 0],
        },
        Yinsh: { onClick: [0, 0] },
    };

    const refusal: MGPValidation = MGPValidation.failure(GameWrapperMessages.CANNOT_PLAY_AS_OBSERVER());
    for (const gameInfo of GameInfo.ALL_GAMES()) {
        it(`clicks method should refuse when observer click (${ gameInfo.urlName })`, fakeAsync(async() => {
            const game: { [methodName: string]: unknown[] } | undefined = clickableMethods[gameInfo.urlName];
            if (game == null) {
                throw new Error('Please define ' + gameInfo.urlName + ' clickable method in here to test them.');
            }
            activatedRouteStub.setRoute('compo', gameInfo.urlName);
            const testUtils: ComponentTestUtils<AbstractGameComponent> =
                await ComponentTestUtils.forGame(gameInfo.urlName);
            const component: AbstractGameComponent = testUtils.getGameComponent();
            await testUtils.getWrapper().setRole(PlayerOrNone.NONE);
            testUtils.detectChanges();
            tick(0);
            expect(component).toBeDefined();
            for (const methodName of Object.keys(game)) {
                const context: string = `click method ${methodName} should be defined for game ${gameInfo.name}`;
                expect(component[methodName]).withContext(context).toBeDefined();
                const clickResult: MGPValidation =
                    await testUtils.expectToDisplayGameMessage(refusal.getReason(), async() => {
                        return component[methodName](...game[methodName]);
                    });
                expect(clickResult).withContext(methodName).toEqual(refusal);
            }
        }));
    }

    for (const gameInfo of GameInfo.ALL_GAMES()) {
        it(`should have an encoder, tutorial and AI for ${ gameInfo.name }`, fakeAsync(async() => {
            // Given a game
            activatedRouteStub.setRoute('compo', gameInfo.urlName);
            const testUtils: ComponentTestUtils<AbstractGameComponent> =
                await ComponentTestUtils.forGame(gameInfo.urlName);

            // When displaying the game
            const component: AbstractGameComponent = testUtils.getGameComponent();
            testUtils.detectChanges();
            tick(0);

            // Then it should have an encoder and a non-empty tutorial
            expect(component.encoder).withContext('Encoder missing for ' + gameInfo.urlName).toBeTruthy();
            expect(component.tutorial).withContext('tutorial missing for ' + gameInfo.urlName).toBeTruthy();
            expect(component.tutorial.length).withContext('tutorial empty for ' + gameInfo.urlName).toBeGreaterThan(0);
            expect(component.availableAIs.length).withContext('AI list empty for ' + gameInfo.urlName).toBeGreaterThan(0);
        }));
    }
});
