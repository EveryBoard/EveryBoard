/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { AbaloneRules } from '@everyboard/games';
import { ApagosRules } from '@everyboard/games';
import { InternationalCheckersRules } from '@everyboard/games';
import { ConspirateursRules } from '@everyboard/games';
import { DvonnRules } from '@everyboard/games';
import { EncapsuleRules } from '@everyboard/games';
import { EpaminondasRules } from '@everyboard/games';
import { GipfRules } from '@everyboard/games';
import { HiveRules } from '@everyboard/games';
import { LinesOfActionRules } from '@everyboard/games';
import { LodestoneRules } from '@everyboard/games';
import { KalahRules } from '@everyboard/games';
import { MartianChessRules } from '@everyboard/games';
import { PentagoRules } from '@everyboard/games';
import { PylosRules } from '@everyboard/games';
import { QuartoRules } from '@everyboard/games';
import { SaharaRules } from '@everyboard/games';
import { SixRules } from '@everyboard/games';
import { SquarzRules } from '@everyboard/games';
import { TrexoRules } from '@everyboard/games';
import { YinshRules } from '@everyboard/games';
import { Coord } from '@everyboard/games';
import { GipfCapture } from '@everyboard/games';
import { HexaDirection } from '@everyboard/games';
import { Move } from '@everyboard/games';
import { Ordinal } from '@everyboard/games';
import { Player, PlayerOrNone } from '@everyboard/games';
import { AbstractRules, SuperRules } from '@everyboard/games';
import { RulesConfig } from '@everyboard/games';
import { GameState } from '@everyboard/games';
import { AbaloneMove } from '@everyboard/games';
import { ApagosMove } from '@everyboard/games';
import { CheckersMove } from '@everyboard/games';
import { ConspirateursMoveSimple, ConspirateursMoveJump } from '@everyboard/games';
import { DvonnMove } from '@everyboard/games';
import { EncapsuleMove } from '@everyboard/games';
import { EncapsulePiece } from '@everyboard/games';
import { EpaminondasMove } from '@everyboard/games';
import { GipfMove, GipfPlacement } from '@everyboard/games';
import { HiveMove } from '@everyboard/games';
import { LinesOfActionMove } from '@everyboard/games';
import { LodestoneMove } from '@everyboard/games';
import { MancalaDistribution } from '@everyboard/games';
import { MancalaMove } from '@everyboard/games';
import { MartianChessMove } from '@everyboard/games';
import { PentagoMove } from '@everyboard/games';
import { PylosCoord } from '@everyboard/games';
import { PylosMove } from '@everyboard/games';
import { QuartoMove } from '@everyboard/games';
import { QuartoPiece } from '@everyboard/games';
import { SaharaMove } from '@everyboard/games';
import { SixMove } from '@everyboard/games';
import { SquarzMove } from '@everyboard/games';
import { TrexoMove } from '@everyboard/games';
import { YinshCapture, YinshMove } from '@everyboard/games';
import { Comparable, MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';
import { MGPValidationTestUtils } from '@everyboard/lib/testing';

import { AbaloneTutorial } from '../../../games/abalone/AbaloneTutorial';
import { ApagosTutorial } from '../../../games/apagos/ApagosTutorial';
import { InternationalCheckersTutorial } from '../../../games/checkers/international-checkers/InternationalCheckersTutorial';
import { ConspirateursTutorial } from '../../../games/conspirateurs/ConspirateursTutorial';
import { DvonnTutorial } from '../../../games/dvonn/DvonnTutorial';
import { EncapsuleTutorial } from '../../../games/encapsule/EncapsuleTutorial';
import { EpaminondasTutorial } from '../../../games/epaminondas/EpaminondasTutorial';
import { GipfTutorial } from '../../../games/gipf/GipfTutorial';
import { HiveTutorial } from '../../../games/hive/HiveTutorial';
import { LinesOfActionTutorial } from '../../../games/lines-of-action/LinesOfActionTutorial';
import { LodestoneTutorial } from '../../../games/lodestone/LodestoneTutorial';
import { KalahTutorial } from '../../../games/mancala/kalah/KalahTutorial';
import { MartianChessTutorial } from '../../../games/martian-chess/MartianChessTutorial';
import { PentagoTutorial } from '../../../games/pentago/PentagoTutorial';
import { PylosTutorial } from '../../../games/pylos/PylosTutorial';
import { QuartoTutorial } from '../../../games/quarto/QuartoTutorial';
import { SaharaTutorial } from '../../../games/sahara/SaharaTutorial';
import { SixTutorial, SixTutorialMessages } from '../../../games/six/SixTutorial';
import { SquarzTutorial } from '../../../games/squarz/SquarzTutorial';
import { TrexoTutorial } from '../../../games/trexo/TrexoTutorial';
import { YinshTutorial, YinshTutorialMessages } from '../../../games/yinsh/YinshTutorial';
import { ComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { AbstractGameComponent } from '../../game-components/game-component/AbstractGameComponent';
import { GameInfo } from '../../normal-component/pick-game/GameInfo';
import { GameWrapper } from '../GameWrapper';

import { Click, TutorialPredicate, TutorialStep } from './TutorialStep';
import { TutorialStepMessage } from './TutorialStepMessage';
import { TutorialGameWrapperComponent } from './tutorial-game-wrapper.component';

describe('TutorialGameWrapperComponent (games)', () => {

    describe('Game should load correctly', () => {

        for (const gameInfo of GameInfo.getAllGames()) {

            it(gameInfo.urlName, fakeAsync(async() => {
                const wrapper: GameWrapper<Comparable> =
                    (await ComponentTestUtils.forGameWithWrapper(gameInfo.urlName, TutorialGameWrapperComponent))
                        .getWrapper();
                expect(wrapper).toBeTruthy();
            }));

        }

    });

    describe('Tutorials', () => {

        it('should have healthy behavior for predicate steps', fakeAsync(async() => {
            const abaloneTutorial: TutorialStep[] = new AbaloneTutorial().tutorial;
            const apagosTutorial: TutorialStep[] = new ApagosTutorial().tutorial;
            const conspirateursTutorial: TutorialStep[] = new ConspirateursTutorial().tutorial;
            const dvonnTutorial: TutorialStep[] = new DvonnTutorial().tutorial;
            const encapsuleTutorial: TutorialStep[] = new EncapsuleTutorial().tutorial;
            const epaminondasTutorial: TutorialStep[] = new EpaminondasTutorial().tutorial;
            const gipfTutorial: TutorialStep[] = new GipfTutorial().tutorial;
            const hiveTutorial: TutorialStep[] = new HiveTutorial().tutorial;
            const internationalCheckerTutorial: TutorialStep[] = new InternationalCheckersTutorial().tutorial;
            const kalahTutorial: TutorialStep[] = new KalahTutorial().tutorial;
            const linesOfActionTutorial: TutorialStep[] = new LinesOfActionTutorial().tutorial;
            const lodestoneTutorial: TutorialStep[] = new LodestoneTutorial().tutorial;
            const martianChessTutorial: TutorialStep[] = new MartianChessTutorial().tutorial;
            const pentagoTutorial: TutorialStep[] = new PentagoTutorial().tutorial;
            const pylosTutorial: TutorialStep[] = new PylosTutorial().tutorial;
            const quartoTutorial: TutorialStep[] = new QuartoTutorial().tutorial;
            const saharaTutorial: TutorialStep[] = new SaharaTutorial().tutorial;
            const sixTutorial: TutorialStep[] = new SixTutorial().tutorial;
            const squarzTutorial: TutorialStep[] = new SquarzTutorial().tutorial;
            const trexoTutorial: TutorialStep[] = new TrexoTutorial().tutorial;
            const yinshTutorial: TutorialStep[] = new YinshTutorial().tutorial;
            const stepExpectations: [AbstractRules, TutorialStep, Move, MGPValidation][] = [
                [
                    AbaloneRules.get(),
                    abaloneTutorial[3],
                    AbaloneMove.ofSingleCoord(new Coord(2, 6), HexaDirection.UP),
                    MGPValidation.failure(`This is not a translation, this is a "pushing move", try a translation.`),
                ], [
                    ApagosRules.get(),
                    apagosTutorial[2],
                    ApagosMove.drop(0, Player.ZERO),
                    MGPValidation.failure(`This move is a drop, please do a transfer!`),
                ], [
                    ApagosRules.get(),
                    apagosTutorial[3],
                    ApagosMove.drop(2, Player.ZERO),
                    MGPValidation.failure(`You actively made your opponent win!`),
                ], [
                    ApagosRules.get(),
                    apagosTutorial[3],
                    ApagosMove.transfer(3, 2).get(),
                    MGPValidation.failure(`Wrong choice, your opponent will win in the next turn no matter which piece is dropped!`),
                ], [
                    ConspirateursRules.get(),
                    conspirateursTutorial[2],
                    ConspirateursMoveJump.from([new Coord(4, 7), new Coord(4, 5)]).get(),
                    MGPValidation.failure(`You have made a jump, not a simple move. Try again!`),
                ], [
                    ConspirateursRules.get(),
                    conspirateursTutorial[3],
                    ConspirateursMoveSimple.from(new Coord(4, 6), new Coord(4, 5)).get(),
                    MGPValidation.failure(`You have not performed a jump. Try again!`),
                ], [
                    DvonnRules.get(),
                    dvonnTutorial[1],
                    DvonnMove.from(new Coord(2, 1), new Coord(3, 0)).get(),
                    MGPValidation.failure(`You have successfully disconnected the stack of 4 pieces of your opponent, but on the next move your opponent will be able to move on your new stack, and to win the game! There exists a better outcome of this situation, try to find it.`),
                ], [
                    DvonnRules.get(),
                    dvonnTutorial[2],
                    DvonnMove.from(new Coord(2, 1), new Coord(1, 1)).get(),
                    MGPValidation.failure(`You have not taken possession of a source, try again.`),
                ], [
                    EncapsuleRules.get(),
                    encapsuleTutorial[3],
                    EncapsuleMove.ofDrop(EncapsulePiece.ofSizeAndPlayer(3, PlayerOrNone.ZERO), new Coord(0, 2)),
                    MGPValidation.failure(`You won, but the exercise is to win while moving a piece!`),
                ], [
                    EncapsuleRules.get(),
                    encapsuleTutorial[3],
                    EncapsuleMove.ofMove(new Coord(0, 0), new Coord(0, 2)),
                    MGPValidation.failure(TutorialStepMessage.FAILED_TRY_AGAIN()),
                ], [
                    EncapsuleRules.get(),
                    encapsuleTutorial[3],
                    EncapsuleMove.ofMove(new Coord(0, 0), new Coord(1, 0)),
                    MGPValidation.failure(TutorialStepMessage.FAILED_TRY_AGAIN()),
                ], [
                    EpaminondasRules.get(),
                    epaminondasTutorial[3],
                    new EpaminondasMove(0, 11, 2, 1, Ordinal.UP),
                    MGPValidation.failure(`Congratulations, you are in advance. But this is not the exercise here, try again.`),
                ], [
                    EpaminondasRules.get(),
                    epaminondasTutorial[4],
                    new EpaminondasMove(0, 10, 1, 1, Ordinal.UP),
                    MGPValidation.failure(`Failed! You moved only one piece.`),
                ], [
                    GipfRules.get(),
                    gipfTutorial[4],
                    new GipfMove(new GipfPlacement(new Coord(6, 3), MGPOptional.empty()),
                                 [new GipfCapture([
                                     new Coord(6, 0), new Coord(6, 1),
                                     new Coord(6, 2), new Coord(6, 3),
                                 ])],
                                 []),
                    MGPValidation.failure($localize`Failed, the best capture takes 2 of your opponent's pieces.`),
                ], [
                    HiveRules.get(),
                    hiveTutorial[8],
                    HiveMove.move(new Coord(1, 0), new Coord(0, 1)).get(),
                    MGPValidation.failure('You have not freed your queen, try again!'),
                ], [
                    InternationalCheckersRules.get(),
                    internationalCheckerTutorial[7],
                    CheckersMove.fromStep(new Coord(2, 9), new Coord(3, 8)),
                    MGPValidation.failure(`You did not move your king.`),
                ], [
                    KalahRules.get(),
                    kalahTutorial[4],
                    MancalaMove.of(MancalaDistribution.of(0, 1)),
                    MGPValidation.failure('This move only distributed one house, do one distribution that ends in the Kalah, then do a second one!'),
                ], [
                    KalahRules.get(),
                    kalahTutorial[5],
                    MancalaMove.of(MancalaDistribution.of(4, 1)),
                    MGPValidation.failure('You did not capture, try again!'),
                ], [
                    LinesOfActionRules.get(),
                    linesOfActionTutorial[4],
                    LinesOfActionMove.from(new Coord(1, 0), new Coord(3, 2)).get(),
                    MGPValidation.failure(TutorialStepMessage.FAILED_TRY_AGAIN()),
                ], [
                    LodestoneRules.get(),
                    lodestoneTutorial[5],
                    new LodestoneMove(new Coord(0, 0), 'push', 'orthogonal'),
                    MGPValidation.failure(TutorialStepMessage.YOU_DID_NOT_CAPTURE_ANY_PIECE()),
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
                    MartianChessRules.get(),
                    martianChessTutorial[2],
                    MartianChessMove.from(new Coord(1, 7), new Coord(0, 6)).get(),
                    MGPValidation.failure(`This is not a pawn!`),
                ], [
                    MartianChessRules.get(),
                    martianChessTutorial[3],
                    MartianChessMove.from(new Coord(1, 5), new Coord(0, 4)).get(),
                    MGPValidation.failure(`This is not a drone!`),
                ], [
                    MartianChessRules.get(),
                    martianChessTutorial[4],
                    MartianChessMove.from(new Coord(1, 0), new Coord(2, 1)).get(),
                    MGPValidation.failure(`This is not a queen!`),
                ], [
                    MartianChessRules.get(),
                    martianChessTutorial[7],
                    MartianChessMove.from(new Coord(1, 7), new Coord(0, 6)).get(),
                    MGPValidation.failure(`This is not a field promotion!`),
                ], [
                    MartianChessRules.get(),
                    martianChessTutorial[8],
                    MartianChessMove.from(new Coord(2, 5), new Coord(3, 4)).get(),
                    MGPValidation.failure(`You did not call the clock!`),
                ], [
                    MartianChessRules.get(),
                    martianChessTutorial[11],
                    MartianChessMove.from(new Coord(2, 4), new Coord(1, 5)).get(),
                    MGPValidation.failure(`Your piece is still in you territory!`),
                ], [
                    PentagoRules.get(),
                    pentagoTutorial[2],
                    PentagoMove.withRotation(0, 0, 0, true),
                    MGPValidation.failure(`You have made a move with a rotation. This tutorial step is about moves without rotations!`),
                ], [
                    PentagoRules.get(),
                    pentagoTutorial[3],
                    PentagoMove.rotationless(0, 0),
                    MGPValidation.failure(`You made a move without rotation, try again!`),
                ], [
                    PylosRules.get(),
                    pylosTutorial[4],
                    PylosMove.ofDrop(new PylosCoord(3, 3, 0), []),
                    MGPValidation.failure(TutorialStepMessage.YOU_DID_NOT_CAPTURE_ANY_PIECE()),
                ], [
                    PylosRules.get(),
                    pylosTutorial[4],
                    PylosMove.ofDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 0, 0)]),
                    MGPValidation.failure(`Failed, you only captured one piece.`),
                ], [
                    QuartoRules.get(),
                    quartoTutorial[3],
                    new QuartoMove(2, 2, QuartoPiece.AABB),
                    MGPValidation.failure($localize`Wrong, you could have won by making a square.`),
                ], [
                    SaharaRules.get(),
                    saharaTutorial[2],
                    SaharaMove.from(new Coord(7, 0), new Coord(5, 0)).get(),
                    MGPValidation.failure(`You have made a double step, which is good but it is the next exercise!`),
                ], [
                    SaharaRules.get(),
                    saharaTutorial[3],
                    SaharaMove.from(new Coord(2, 0), new Coord(2, 1)).get(),
                    MGPValidation.failure(`Failed! You have made a single step.`),
                ], [
                    SixRules.get(),
                    sixTutorial[4],
                    SixMove.ofTranslation(new Coord(6, 1), new Coord(7, 1)),
                    MGPValidation.failure(SixTutorialMessages.MOVEMENT_NOT_DISCONNECTING()),
                ], [
                    SixRules.get(),
                    sixTutorial[4],
                    SixMove.ofTranslation(new Coord(6, 1), new Coord(6, 0)),
                    MGPValidation.failure(SixTutorialMessages.MOVEMENT_SELF_DISCONNECTING()),
                ], [
                    SixRules.get(),
                    sixTutorial[5],
                    SixMove.ofTranslation(new Coord(0, 6), new Coord(1, 6)),
                    MGPValidation.failure(`This move does not disconnect your opponent's pieces. Try again with another piece.`),
                ], [
                    SixRules.get(),
                    sixTutorial[6],
                    SixMove.ofTranslation(new Coord(2, 3), new Coord(3, 3)),
                    MGPValidation.failure(`This move has not cut the board in two equal halves.`),
                ], [
                    SixRules.get(),
                    sixTutorial[6],
                    SixMove.ofCut(new Coord(2, 3), new Coord(1, 3), new Coord(3, 2)),
                    MGPValidation.failure(`Failed. You did cut the board in two but you kept the half where you're in minority. Therefore, you lost! Try again.`),
                ], [
                    SquarzRules.get(),
                    squarzTutorial[1],
                    SquarzMove.from(new Coord(0, 0), new Coord(2, 2)).get(),
                    MGPValidation.failure(`This was a jump, try to do a duplication.`),
                ], [
                    SquarzRules.get(),
                    squarzTutorial[2],
                    SquarzMove.from(new Coord(0, 7), new Coord(1, 7)).get(),
                    MGPValidation.failure(`This was a duplication, try a jump now.`),
                ], [
                    SquarzRules.get(),
                    squarzTutorial[3],
                    SquarzMove.from(new Coord(2, 5), new Coord(0, 7)).get(),
                    MGPValidation.failure(TutorialStepMessage.YOU_DID_NOT_CAPTURE_ANY_PIECE()),
                ], [
                    SquarzRules.get(),
                    squarzTutorial[4],
                    SquarzMove.from(new Coord(5, 5), new Coord(3, 4)).get(),
                    MGPValidation.failure(`Bad choice, by making this move you allowed the opponent to win.<br/><br/>Try again!`),
                ], [
                    TrexoRules.get(),
                    trexoTutorial[3],
                    TrexoMove.from(new Coord(0, 0), new Coord(1, 0)).get(),
                    MGPValidation.failure(TutorialStepMessage.FAILED_TRY_AGAIN()),
                ], [
                    YinshRules.get(),
                    yinshTutorial[3],
                    new YinshMove([], new Coord(4, 4), MGPOptional.of(new Coord(1, 4)), []),
                    MGPValidation.failure(YinshTutorialMessages.MUST_ALIGN_FIVE()),
                ], [
                    YinshRules.get(),
                    yinshTutorial[4],
                    new YinshMove([YinshCapture.of(new Coord(5, 4), new Coord(5, 8), MGPOptional.of(new Coord(3, 2)))],
                                  new Coord(4, 1), MGPOptional.of(new Coord(6, 1)),
                                  []),
                    MGPValidation.failure(YinshTutorialMessages.MUST_CAPTURE_TWO()),
                ],
            ];
            let i: number = 0;
            for (const stepExpectation of stepExpectations) {
                const rules: SuperRules<Move, GameState, RulesConfig, unknown> = stepExpectation[0];
                const step: TutorialStep = stepExpectation[1];
                if (step.isPredicate()) {
                    const config: RulesConfig = rules.getDefaultRulesConfig();
                    const move: Move = stepExpectation[2];
                    const state: GameState = step.state;
                    const moveResult: MGPFallible<unknown> = rules.isLegal(move, state, config);
                    if (moveResult.isSuccess()) {
                        const resultingState: GameState =
                            rules.applyLegalMove(move, state, config, moveResult.get());
                        const validation: MGPValidation = stepExpectation[3];
                        expect(Utils.getNonNullable(step.predicate)(move, state, resultingState))
                            .withContext(move.toString() + ' for step ' + i + '(' + step.title + ')')
                            .toEqual(validation);
                    } else {
                        const failure: MGPValidation = MGPValidation.ofFallible(moveResult);
                        const context: string = 'Move should be legal to reach predicate but failed in "' + step.title +
                                                '" because "' + failure.getReason() + '"';
                        MGPValidationTestUtils.expectToBeSuccess(failure, context);
                    }
                } else {
                    throw new Error('This test expects only predicate steps, remove "' + step.title + '"');
                }
                i++;
            }
        }));

        for (const gameInfo of GameInfo.getAllGames()) {

            it('should make sure all solution moves are legal for ' + gameInfo.name, fakeAsync(async() => {
                const gameComponent: AbstractGameComponent =
                    (await ComponentTestUtils.forGameWithWrapper(gameInfo.urlName,
                                                                 TutorialGameWrapperComponent))
                        .getGameComponent();
                const rules: SuperRules<Move, GameState, RulesConfig, unknown> = gameComponent.rules;
                const steps: TutorialStep[] = gameComponent.tutorial;
                const gameInfoConfig: RulesConfig = gameInfo.getRulesConfig();
                for (const step of steps) {
                    const config: RulesConfig = step.config.getOrElse(gameInfoConfig);
                    const state: GameState = step.state;
                    if (step.hasSolution()) {
                        const solution: Move | Click = step.getSolution();
                        if (solution instanceof Move) {
                            const moveResult: MGPFallible<unknown> = rules.isLegal(solution, state, config);
                            if (moveResult.isSuccess()) {
                                if (step.isPredicate()) {
                                    const resultingState: GameState =
                                        rules.applyLegalMove(solution, state, config, moveResult.get());
                                    const predicate: TutorialPredicate = Utils.getNonNullable(step.predicate);
                                    const result: MGPValidation = predicate(solution, state, resultingState);
                                    expect(result).withContext(step.title).toEqual(MGPValidation.SUCCESS);
                                }
                            } else {
                                const context: string = 'Solution move should be legal but failed in "' + gameInfo.name + ': '+ step.title + '"';
                                expect(moveResult.getReason()).withContext(context).toBeNull();
                            }
                        }
                    }
                }
            }));

            it('should display the step and solution move without error for ' + gameInfo.name, fakeAsync(async() => {
                const testUtils: ComponentTestUtils<AbstractGameComponent, Comparable> =
                    await ComponentTestUtils.forGameWithWrapper(gameInfo.urlName, TutorialGameWrapperComponent);
                const wrapper: TutorialGameWrapperComponent = testUtils.getWrapper() as TutorialGameWrapperComponent;
                const gameComponent: AbstractGameComponent = testUtils.getGameComponent();
                for (const step of gameComponent.tutorial) {
                    // Display the step
                    try {
                        await wrapper.startTutorial([step]);
                        if (step.hasSolution()) {
                            // Perform the solution
                            const solution: Move | Click = step.getSolution();
                            if (solution instanceof Move) {
                                const validity: MGPValidation = await wrapper.receiveValidMove(solution);
                                expect(validity).withContext(`step ${step.title} should have a valid solution`).toEqual(MGPValidation.SUCCESS);
                            } else {
                                await testUtils.expectClickSuccess(solution, `step ${step.title} should have a valid solution`);
                            }
                        }
                    } catch (e: unknown) {
                        expect(e).withContext(`step ${step.title} has thrown an exception`).toBeUndefined();
                    }
                }
            }));

        }

    });

});
