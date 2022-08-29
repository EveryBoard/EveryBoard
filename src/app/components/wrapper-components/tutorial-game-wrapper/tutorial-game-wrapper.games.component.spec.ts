/* eslint-disable max-lines-per-function */
import { TutorialGameWrapperComponent } from './tutorial-game-wrapper.component';
import { ComponentTestUtils, TestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { GameWrapper } from '../GameWrapper';
import { Click, TutorialStep } from './TutorialStep';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Move } from 'src/app/jscaip/Move';
import { Coord } from 'src/app/jscaip/Coord';
import { Rules } from 'src/app/jscaip/Rules';
import { Direction } from 'src/app/jscaip/Direction';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameState } from 'src/app/jscaip/GameState';
import { Utils } from 'src/app/utils/utils';
import { Player } from 'src/app/jscaip/Player';
import { MGPFallible } from 'src/app/utils/MGPFallible';

import { ApagosTutorial } from 'src/app/games/apagos/ApagosTutorial';
import { ApagosRules } from 'src/app/games/apagos/ApagosRules';
import { ApagosState } from 'src/app/games/apagos/ApagosState';
import { ApagosMove } from 'src/app/games/apagos/ApagosMove';
import { ApagosCoord } from 'src/app/games/apagos/ApagosCoord';

import { ConspirateursTutorial } from 'src/app/games/conspirateurs/ConspirateursTutorial';
import { ConspirateursRules } from 'src/app/games/conspirateurs/ConspirateursRules';
import { ConspirateursMoveSimple, ConspirateursMoveJump } from 'src/app/games/conspirateurs/ConspirateursMove';

import { DvonnRules } from 'src/app/games/dvonn/DvonnRules';
import { DvonnTutorial } from 'src/app/games/dvonn/DvonnTutorial';
import { DvonnMove } from 'src/app/games/dvonn/DvonnMove';
import { DvonnState } from 'src/app/games/dvonn/DvonnState';

import { EncapsuleRules } from 'src/app/games/encapsule/EncapsuleRules';
import { EncapsuleState } from 'src/app/games/encapsule/EncapsuleState';
import { EncapsuleTutorial } from 'src/app/games/encapsule/EncapsuleTutorial';
import { EncapsuleMove } from 'src/app/games/encapsule/EncapsuleMove';
import { EncapsulePiece } from 'src/app/games/encapsule/EncapsulePiece';

import { EpaminondasRules } from 'src/app/games/epaminondas/EpaminondasRules';
import { EpaminondasState } from 'src/app/games/epaminondas/EpaminondasState';
import { EpaminondasTutorial } from '../../../games/epaminondas/EpaminondasTutorial';
import { EpaminondasMove } from 'src/app/games/epaminondas/EpaminondasMove';

import { LodestoneTutorial } from 'src/app/games/lodestone/LodestoneTutorial';
import { LodestoneRules } from 'src/app/games/lodestone/LodestoneRules';
import { LodestoneMove } from 'src/app/games/lodestone/LodestoneMove';

import { MartianChessTutorial, NOT_A_FIELD_PROMOTION } from 'src/app/games/martian-chess/MartianChessTutorial';
import { MartianChessRules } from 'src/app/games/martian-chess/MartianChessRules';
import { MartianChessState } from 'src/app/games/martian-chess/MartianChessState';
import { MartianChessMove } from 'src/app/games/martian-chess/MartianChessMove';

import { PentagoRules } from 'src/app/games/pentago/PentagoRules';
import { PentagoState } from 'src/app/games/pentago/PentagoState';
import { PentagoTutorial } from 'src/app/games/pentago/PentagoTutorial';
import { PentagoMove } from 'src/app/games/pentago/PentagoMove';

import { PylosRules } from 'src/app/games/pylos/PylosRules';
import { PylosState } from 'src/app/games/pylos/PylosState';
import { PylosTutorial } from 'src/app/games/pylos/PylosTutorial';
import { PylosMove } from 'src/app/games/pylos/PylosMove';
import { PylosCoord } from 'src/app/games/pylos/PylosCoord';

import { SaharaTutorial } from '../../../games/sahara/SaharaTutorial';
import { SaharaRules } from 'src/app/games/sahara/SaharaRules';
import { SaharaState } from 'src/app/games/sahara/SaharaState';
import { SaharaMove } from 'src/app/games/sahara/SaharaMove';

import { SixMove } from 'src/app/games/six/SixMove';
import { SixRules } from 'src/app/games/six/SixRules';
import { SixState } from 'src/app/games/six/SixState';
import { SixTutorial, SixTutorialMessages } from '../../../games/six/SixTutorial';

import { YinshRules } from 'src/app/games/yinsh/YinshRules';
import { YinshState } from 'src/app/games/yinsh/YinshState';
import { YinshTutorial, YinshTutorialMessages } from 'src/app/games/yinsh/YinshTutorial';
import { YinshCapture, YinshMove } from 'src/app/games/yinsh/YinshMove';

import { TutorialStepFailure } from './TutorialStepFailure';
import { Comparable } from 'src/app/utils/Comparable';

describe('TutorialGameWrapperComponent (games)', () => {

    describe('Game should load correctly', () => {
        for (const game of GameInfo.ALL_GAMES()) {
            if (game.display) {
                it(game.urlName, fakeAsync(async() => {
                    const wrapper: GameWrapper<Comparable> =
                        (await ComponentTestUtils.forGameWithWrapper(game.urlName, TutorialGameWrapperComponent))
                            .wrapper;
                    expect(wrapper).toBeTruthy();
                }));
            }
        }
    });
    describe('Tutorials', () => {
        it('Should make sure that predicate step have healthy behaviors', fakeAsync(async() => {
            const apagosTutorial: TutorialStep[] = new ApagosTutorial().tutorial;
            const conspirateursTutorial: TutorialStep[] = new ConspirateursTutorial().tutorial;
            const dvonnTutorial: TutorialStep[] = new DvonnTutorial().tutorial;
            const encapsuleTutorial: TutorialStep[] = new EncapsuleTutorial().tutorial;
            const epaminondasTutorial: TutorialStep[] = new EpaminondasTutorial().tutorial;
            const lodestoneTutorial: TutorialStep[] = new LodestoneTutorial().tutorial;
            const martianChessTutorial: TutorialStep[] = new MartianChessTutorial().tutorial;
            const pentagoTutorial: TutorialStep[] = new PentagoTutorial().tutorial;
            const pylosTutorial: TutorialStep[] = new PylosTutorial().tutorial;
            const saharaTutorial: TutorialStep[] = new SaharaTutorial().tutorial;
            const sixTutorial: TutorialStep[] = new SixTutorial().tutorial;
            const yinshTutorial: TutorialStep[] = new YinshTutorial().tutorial;
            const stepExpectations: [Rules<Move, GameState, unknown>, TutorialStep, Move, MGPValidation][] = [
                [
                    new ApagosRules(ApagosState),
                    apagosTutorial[2],
                    ApagosMove.drop(ApagosCoord.ZERO, Player.ZERO),
                    MGPValidation.failure(`This move is a drop, please do a transfer!`),
                ], [
                    new ApagosRules(ApagosState),
                    apagosTutorial[3],
                    ApagosMove.drop(ApagosCoord.TWO, Player.ZERO),
                    MGPValidation.failure(`You actively made your opponent win!`),
                ], [
                    new ApagosRules(ApagosState),
                    apagosTutorial[3],
                    ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.TWO).get(),
                    MGPValidation.failure(`Wrong choice, your opponent will win in the next turn no matter which piece is dropped!`),
                ], [
                    ConspirateursRules.get(),
                    conspirateursTutorial[2],
                    ConspirateursMoveJump.of([new Coord(4, 7), new Coord(4, 5)]).get(),
                    MGPValidation.failure(`You have made a jump, not a simple move. Try again!`),
                ], [
                    ConspirateursRules.get(),
                    conspirateursTutorial[3],
                    ConspirateursMoveSimple.of(new Coord(4, 6), new Coord(4, 5)).get(),
                    MGPValidation.failure(`You have not performed a jump. Try again!`),
                ], [
                    new DvonnRules(DvonnState),
                    dvonnTutorial[1],
                    DvonnMove.of(new Coord(2, 1), new Coord(3, 0)),
                    MGPValidation.failure(`You have successfully disconnected the stack of 4 pieces of your opponent, but on the next move your opponent will be able to move on your new stack, and to win the game! There exists a better outcome of this situation, try to find it.`),
                ], [
                    new DvonnRules(DvonnState),
                    dvonnTutorial[2],
                    DvonnMove.of(new Coord(2, 1), new Coord(1, 1)),
                    MGPValidation.failure(`You have not taken possession of a source, try again.`),
                ], [
                    new EncapsuleRules(EncapsuleState),
                    encapsuleTutorial[3],
                    EncapsuleMove.fromDrop(EncapsulePiece.BIG_DARK, new Coord(0, 2)),
                    MGPValidation.failure(`You won, but the exercise is to win while moving a piece!`),
                ], [
                    new EncapsuleRules(EncapsuleState),
                    encapsuleTutorial[3],
                    EncapsuleMove.fromMove(new Coord(0, 0), new Coord(0, 2)),
                    MGPValidation.failure(`Failed. Try again.`),
                ], [
                    new EncapsuleRules(EncapsuleState),
                    encapsuleTutorial[3],
                    EncapsuleMove.fromMove(new Coord(0, 0), new Coord(1, 0)),
                    MGPValidation.failure(`Failed. Try again.`),
                ], [
                    new EpaminondasRules(EpaminondasState),
                    epaminondasTutorial[3],
                    new EpaminondasMove(0, 11, 2, 1, Direction.UP),
                    MGPValidation.failure(`Congratulations, you are in advance. But this is not the exercise here, try again.`),
                ], [
                    new EpaminondasRules(EpaminondasState),
                    epaminondasTutorial[4],
                    new EpaminondasMove(0, 10, 1, 1, Direction.UP),
                    MGPValidation.failure(`Failed! You moved only one piece.`),
                ], [
                    LodestoneRules.get(),
                    lodestoneTutorial[5],
                    new LodestoneMove(new Coord(0, 0), 'push', 'orthogonal'),
                    MGPValidation.failure(`You have not captured any of the opponent's pieces, try again!`),
                ], [
                    LodestoneRules.get(),
                    lodestoneTutorial[6],
                    new LodestoneMove(new Coord(0, 0), 'push', 'orthogonal'),
                    MGPValidation.failure(`You must capture and place your capture on the top pressure plate to make it crumble!`),
                ], [
                    LodestoneRules.get(),
                    lodestoneTutorial[7],
                    new LodestoneMove(new Coord(0, 1), 'push', 'orthogonal'),
                    MGPValidation.failure(`You must capture and place your capture on the top pressure plate to make it crumble a second time!`),
                ], [
                    new MartianChessRules(MartianChessState),
                    martianChessTutorial[2],
                    MartianChessMove.from(new Coord(2, 0), new Coord(3, 1)).get(),
                    MGPValidation.failure(`This is not a pawn!`),
                ], [
                    new MartianChessRules(MartianChessState),
                    martianChessTutorial[3],
                    MartianChessMove.from(new Coord(2, 2), new Coord(3, 3)).get(),
                    MGPValidation.failure(`This is not a drone!`),
                ], [
                    new MartianChessRules(MartianChessState),
                    martianChessTutorial[4],
                    MartianChessMove.from(new Coord(1, 0), new Coord(2, 1)).get(),
                    MGPValidation.failure(`This is not a queen!`),
                ], [
                    new MartianChessRules(MartianChessState),
                    martianChessTutorial[7],
                    MartianChessMove.from(new Coord(1, 7), new Coord(0, 6)).get(),
                    MGPValidation.failure(NOT_A_FIELD_PROMOTION()),
                ], [
                    new MartianChessRules(MartianChessState),
                    martianChessTutorial[8],
                    MartianChessMove.from(new Coord(1, 2), new Coord(0, 3)).get(),
                    MGPValidation.failure(`You did not call the clock!`),
                ], [
                    new MartianChessRules(MartianChessState),
                    martianChessTutorial[11],
                    MartianChessMove.from(new Coord(2, 4), new Coord(1, 5)).get(),
                    MGPValidation.failure(`Your piece is still in you territory!`),
                ], [
                    new PentagoRules(PentagoState),
                    pentagoTutorial[2],
                    PentagoMove.withRotation(0, 0, 0, true),
                    MGPValidation.failure(`You have made a move with a rotation. This tutorial step is about moves without rotations!`),
                ], [
                    new PentagoRules(PentagoState),
                    pentagoTutorial[3],
                    PentagoMove.rotationless(0, 0),
                    MGPValidation.failure(`You made a move without rotation, try again!`),
                ], [
                    new PylosRules(PylosState),
                    pylosTutorial[4],
                    PylosMove.fromDrop(new PylosCoord(3, 3, 0), []),
                    MGPValidation.failure(TutorialStepFailure.YOU_DID_NOT_CAPTURE_ANY_PIECE()),
                ], [
                    new PylosRules(PylosState),
                    pylosTutorial[4],
                    PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 0, 0)]),
                    MGPValidation.failure(`Failed, you only captured one piece.`),
                ], [
                    new SaharaRules(SaharaState),
                    saharaTutorial[2],
                    SaharaMove.from(new Coord(7, 0), new Coord(5, 0)).get(),
                    MGPValidation.failure(`You have made a double step, which is good but it is the next exercise!`),
                ], [
                    new SaharaRules(SaharaState),
                    saharaTutorial[3],
                    SaharaMove.from(new Coord(2, 0), new Coord(2, 1)).get(),
                    MGPValidation.failure(`Failed! You have made a single step.`),
                ], [
                    new SixRules(SixState),
                    sixTutorial[4],
                    SixMove.fromMovement(new Coord(6, 1), new Coord(7, 1)),
                    MGPValidation.failure(SixTutorialMessages.MOVEMENT_NOT_DISCONNECTING()),
                ], [
                    new SixRules(SixState),
                    sixTutorial[4],
                    SixMove.fromMovement(new Coord(6, 1), new Coord(6, 0)),
                    MGPValidation.failure(SixTutorialMessages.MOVEMENT_SELF_DISCONNECTING()),
                ], [
                    new SixRules(SixState),
                    sixTutorial[5],
                    SixMove.fromMovement(new Coord(0, 6), new Coord(1, 6)),
                    MGPValidation.failure(`This move does not disconnect your opponent's pieces. Try again with another piece.`),
                ], [
                    new SixRules(SixState),
                    sixTutorial[6],
                    SixMove.fromMovement(new Coord(2, 3), new Coord(3, 3)),
                    MGPValidation.failure(`This move has not cut the board in two equal halves.`),
                ], [
                    new SixRules(SixState),
                    sixTutorial[6],
                    SixMove.fromCut(new Coord(2, 3), new Coord(1, 3), new Coord(3, 2)),
                    MGPValidation.failure(`Failed. You did cut the board in two but you kept the half where you're in minority. Therefore, you lost! Try again.`),
                ], [
                    new YinshRules(YinshState),
                    yinshTutorial[3],
                    new YinshMove([], new Coord(4, 4), MGPOptional.of(new Coord(1, 4)), []),
                    MGPValidation.failure(YinshTutorialMessages.MUST_ALIGN_FIVE()),
                ], [
                    new YinshRules(YinshState),
                    yinshTutorial[4],
                    new YinshMove([YinshCapture.of(new Coord(5, 4), new Coord(5, 8), new Coord(3, 2))],
                                  new Coord(4, 1), MGPOptional.of(new Coord(6, 1)),
                                  []),
                    MGPValidation.failure(YinshTutorialMessages.MUST_CAPTURE_TWO()),
                ],
            ];
            for (const stepExpectation of stepExpectations) {
                const rules: Rules<Move, GameState, unknown> = stepExpectation[0];
                const step: TutorialStep = stepExpectation[1];
                if (step.isPredicate()) {
                    const move: Move = stepExpectation[2];
                    const moveResult: MGPFallible<unknown> = rules.isLegal(move, step.state);
                    if (moveResult.isSuccess()) {
                        const state: GameState = rules.applyLegalMove(move, step.state, moveResult.get());
                        const validation: MGPValidation = stepExpectation[3];
                        expect(Utils.getNonNullable(step.predicate)(move, state)).toEqual(validation);
                    } else {
                        const context: string = 'Move should be legal to reach predicate but failed in "' + step.title+ '" because';
                        TestUtils.expectValidationSuccess(MGPValidation.ofFallible(moveResult), context);
                    }
                } else {
                    throw new Error('This test expects only predicate steps, remove "' + step.title + '"');
                }
            }
        }));
        it('Should make sure all solutionMove are legal', fakeAsync(async() => {
            for (const gameInfo of GameInfo.ALL_GAMES()) {
                if (gameInfo.display === false) {
                    continue;
                }
                const gameComponent: AbstractGameComponent =
                    TestBed.createComponent(gameInfo.component).debugElement.componentInstance;
                const rules: Rules<Move, GameState, unknown> = gameComponent.rules;
                const steps: TutorialStep[] = gameComponent.tutorial;
                for (const step of steps) {
                    if (step.hasSolution()) {
                        const solution: Move | Click = step.getSolution();
                        if (solution instanceof Move) {
                            const moveResult: MGPFallible<unknown> = rules.isLegal(solution, step.state);
                            if (moveResult.isSuccess()) {
                                if (step.isPredicate()) {
                                    const state: GameState =
                                        rules.applyLegalMove(solution, step.state, moveResult.get());
                                    expect(Utils.getNonNullable(step.predicate)(solution, state))
                                        .toEqual(MGPValidation.SUCCESS);
                                }
                            } else {
                                const context: string = 'Solution move should be legal but failed in "' + step.title + '"';
                                expect(moveResult.getReason()).withContext(context).toBeNull();
                            }
                        }
                    }
                }
            }
        }));
    });
});
