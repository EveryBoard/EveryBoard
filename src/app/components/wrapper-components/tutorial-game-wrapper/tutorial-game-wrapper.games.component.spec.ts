/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Comparable, MGPFallible, MGPOptional, MGPValidation, MGPValidationTestUtils, Utils } from '@everyboard/lib';

import { TutorialGameWrapperComponent } from './tutorial-game-wrapper.component';
import { Click, TutorialPredicate, TutorialStep } from './TutorialStep';
import { TutorialStepMessage } from './TutorialStepMessage';

import { ComponentTestUtils } from '../../../../app/utils/tests/TestUtils.spec';
import { GameInfo } from '../../normal-component/pick-game/game-info';
import { GameWrapper } from '../GameWrapper';
import { Move } from '../../../../app/jscaip/Move';
import { Coord } from '../../../../app/jscaip/Coord';
import { AbstractRules, SuperRules } from '../../../../app/jscaip/Rules';
import { Ordinal } from '../../../../app/jscaip/Ordinal';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { GameState } from '../../../../app/jscaip/state/GameState';
import { Player, PlayerOrNone } from '../../../../app/jscaip/Player';
import { RulesConfig } from '../../../../app/jscaip/RulesConfigUtil';
import { HexaDirection } from '../../../../app/jscaip/HexaDirection';

import { AbaloneMove } from '../../../../app/games/abalone/AbaloneMove';
import { AbaloneRules } from '../../../../app/games/abalone/AbaloneRules';
import { AbaloneTutorial } from '../../../../app/games/abalone/AbaloneTutorial';
import { ApagosMove } from '../../../../app/games/apagos/ApagosMove';
import { ApagosRules } from '../../../../app/games/apagos/ApagosRules';
import { ApagosTutorial } from '../../../../app/games/apagos/ApagosTutorial';

import { CheckersMove } from '../../../../app/games/checkers/common/CheckersMove';

import { ConspirateursMoveSimple, ConspirateursMoveJump } from '../../../../app/games/conspirateurs/ConspirateursMove';
import { ConspirateursRules } from '../../../../app/games/conspirateurs/ConspirateursRules';
import { ConspirateursTutorial } from '../../../../app/games/conspirateurs/ConspirateursTutorial';

import { DvonnMove } from '../../../../app/games/dvonn/DvonnMove';
import { DvonnRules } from '../../../../app/games/dvonn/DvonnRules';
import { DvonnTutorial } from '../../../../app/games/dvonn/DvonnTutorial';

import { EncapsuleMove } from '../../../../app/games/encapsule/EncapsuleMove';
import { EncapsulePiece } from '../../../../app/games/encapsule/EncapsulePiece';
import { EncapsuleRules } from '../../../../app/games/encapsule/EncapsuleRules';
import { EncapsuleTutorial } from '../../../../app/games/encapsule/EncapsuleTutorial';
import { EpaminondasMove } from '../../../../app/games/epaminondas/EpaminondasMove';
import { EpaminondasRules } from '../../../../app/games/epaminondas/EpaminondasRules';
import { EpaminondasTutorial } from '../../../games/epaminondas/EpaminondasTutorial';

import { GipfCapture } from '../../../../app/jscaip/GipfProjectHelper';
import { GipfMove, GipfPlacement } from '../../../../app/games/gipf/GipfMove';
import { GipfRules } from '../../../../app/games/gipf/GipfRules';
import { GipfTutorial } from '../../../../app/games/gipf/GipfTutorial';

import { HiveMove } from '../../../../app/games/hive/HiveMove';
import { HiveRules } from '../../../../app/games/hive/HiveRules';
import { HiveTutorial } from '../../../../app/games/hive/HiveTutorial';

import { InternationalCheckersRules } from '../../../../app/games/checkers/international-checkers/InternationalCheckersRules';
import { InternationalCheckersTutorial } from '../../../../app/games/checkers/international-checkers/InternationalCheckersTutorial';

import { KalahRules } from '../../../../app/games/mancala/kalah/KalahRules';
import { KalahTutorial } from '../../../../app/games/mancala/kalah/KalahTutorial';

import { LinesOfActionMove } from '../../../../app/games/lines-of-action/LinesOfActionMove';
import { LinesOfActionRules } from '../../../../app/games/lines-of-action/LinesOfActionRules';
import { LinesOfActionTutorial } from '../../../../app/games/lines-of-action/LinesOfActionTutorial';
import { LodestoneMove } from '../../../../app/games/lodestone/LodestoneMove';
import { LodestoneRules } from '../../../../app/games/lodestone/LodestoneRules';
import { LodestoneTutorial } from '../../../../app/games/lodestone/LodestoneTutorial';

import { MancalaDistribution } from '../../../../app/games/mancala/common/MancalaMove';
import { MancalaMove } from '../../../../app/games/mancala/common/MancalaMove';
import { MartianChessMove } from '../../../../app/games/martian-chess/MartianChessMove';
import { MartianChessRules } from '../../../../app/games/martian-chess/MartianChessRules';
import { MartianChessTutorial } from '../../../../app/games/martian-chess/MartianChessTutorial';

import { PentagoMove } from '../../../../app/games/pentago/PentagoMove';
import { PentagoRules } from '../../../../app/games/pentago/PentagoRules';
import { PentagoTutorial } from '../../../../app/games/pentago/PentagoTutorial';
import { PylosCoord } from '../../../../app/games/pylos/PylosCoord';
import { PylosMove } from '../../../../app/games/pylos/PylosMove';
import { PylosRules } from '../../../../app/games/pylos/PylosRules';
import { PylosTutorial } from '../../../../app/games/pylos/PylosTutorial';

import { QuartoMove } from '../../../../app/games/quarto/QuartoMove';
import { QuartoPiece } from '../../../../app/games/quarto/QuartoPiece';
import { QuartoRules } from '../../../../app/games/quarto/QuartoRules';
import { QuartoTutorial } from '../../../../app/games/quarto/QuartoTutorial';

import { SaharaMove } from '../../../../app/games/sahara/SaharaMove';
import { SaharaRules } from '../../../../app/games/sahara/SaharaRules';
import { SaharaTutorial } from '../../../games/sahara/SaharaTutorial';
import { SixMove } from '../../../../app/games/six/SixMove';
import { SixRules } from '../../../../app/games/six/SixRules';
import { SixTutorial, SixTutorialMessages } from '../../../games/six/SixTutorial';
import { SquarzMove } from '../../../../app/games/squarz/SquarzMove';
import { SquarzRules } from '../../../../app/games/squarz/SquarzRules';
import { SquarzTutorial } from '../../../../app/games/squarz/SquarzTutorial';

import { TrexoMove } from '../../../../app/games/trexo/TrexoMove';
import { TrexoRules } from '../../../../app/games/trexo/TrexoRules';
import { TrexoTutorial } from '../../../../app/games/trexo/TrexoTutorial';

import { YinshCapture, YinshMove } from '../../../../app/games/yinsh/YinshMove';
import { YinshRules } from '../../../../app/games/yinsh/YinshRules';
import { YinshTutorial, YinshTutorialMessages } from '../../../../app/games/yinsh/YinshTutorial';

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
                    MancalaMove.of(MancalaDistribution.of(0)),
                    MGPValidation.failure('This move only distributed one house, do one distribution that ends in the Kalah, then do a second one!'),
                ], [
                    KalahRules.get(),
                    kalahTutorial[5],
                    MancalaMove.of(MancalaDistribution.of(4)),
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
                    const config: MGPOptional<RulesConfig> = rules.getDefaultRulesConfig();
                    const move: Move = stepExpectation[2];
                    const moveResult: MGPFallible<unknown> = rules.isLegal(move, step.state, config);
                    if (moveResult.isSuccess()) {
                        const resultingState: GameState =
                            rules.applyLegalMove(move, step.state, config, moveResult.get());
                        const validation: MGPValidation = stepExpectation[3];
                        expect(Utils.getNonNullable(step.predicate)(move, step.state, resultingState))
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
                const config: MGPOptional<RulesConfig> = gameInfo.getRulesConfig();
                for (const step of steps) {
                    if (step.hasSolution()) {
                        const solution: Move | Click = step.getSolution();
                        if (solution instanceof Move) {
                            const moveResult: MGPFallible<unknown> = rules.isLegal(solution, step.state, config);
                            if (moveResult.isSuccess()) {
                                if (step.isPredicate()) {
                                    const resultingState: GameState =
                                        rules.applyLegalMove(solution, step.state, config, moveResult.get());
                                    const predicate: TutorialPredicate = Utils.getNonNullable(step.predicate);
                                    const result: MGPValidation = predicate(solution, step.state, resultingState);
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
