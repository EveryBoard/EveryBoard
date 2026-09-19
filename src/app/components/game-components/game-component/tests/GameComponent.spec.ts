/* eslint-disable max-lines-per-function */
import { fakeAsync, tick } from '@angular/core/testing';

import { JSONValue, MGPValidation, Utils } from '@everyboard/lib';

import { AbaloneComponent } from '../../../../games/abalone/abalone.component';
import { AIDepthLimitOptions, MoveGenerator } from '../../../../jscaip/AI/AI';
import { createMCTSFromConfig } from '../../../../jscaip/AI/AIConfigUtils';
import { BoardValue } from '../../../../jscaip/AI/BoardValue';
import { Heuristic } from '../../../../jscaip/AI/Heuristic';
import { MCTS } from '../../../../jscaip/AI/MCTS';
import { Minimax } from '../../../../jscaip/AI/Minimax';
import { Move } from '../../../../jscaip/Move';
import { Player } from '../../../../jscaip/Player';
import { RulesConfig } from '../../../../jscaip/RulesConfigUtil';
import { GameState } from '../../../../jscaip/state/GameState';
import { ErrorLoggerServiceMock } from '../../../../services/tests/ErrorLoggerServiceMock.spec';
import {
    ActivatedRouteStub,
    ComponentTestUtils,
    ConfigureTestingModuleUtils,
    createConfiguredMinimaxForTest,
    expectToBeAbleToPlayAgainstItself,
    getShallowestMinimaxOptions,
    SlowTest,
    UNIVERSAL_SELF_PLAY_PLIES,
} from '../../../../utils/tests/TestUtils.spec';
import { GameInfo } from '../../../normal-component/pick-game/GameInfo';
import { AbstractGameComponent } from '../AbstractGameComponent';

describe('GameComponent', () => {

    const activatedRouteStub: ActivatedRouteStub = new ActivatedRouteStub();

    beforeEach(fakeAsync(async() => {
        await ConfigureTestingModuleUtils.configureTestingModuleForGame(activatedRouteStub);
    }));

    it('should fail if pass() is called on a game that does not support it', fakeAsync(async() => {
        // Given such a game, like Abalone
        activatedRouteStub.setRoute('game', 'Abalone');
        const testUtils: ComponentTestUtils<AbaloneComponent> = await ComponentTestUtils.forGame('Abalone', false);
        const component: AbstractGameComponent = testUtils.getGameComponent();
        expect(component).toBeDefined();
        testUtils.getWrapper().role = Player.ONE;
        testUtils.detectChanges();
        tick(0);

        spyOn(Utils, 'logError').and.callFake(ErrorLoggerServiceMock.logError);

        // When the player tries to pass
        const result: MGPValidation = await component.pass();

        // Then should fail and call logError
        const errorMessage: string = 'pass() called on a game that does not redefine it';
        const errorData: JSONValue = { gameName: 'AbaloneComponent' };
        expect(result.isFailure()).toBeTrue();
        expect(result.getReason()).toEqual('GameComponent: ' + errorMessage);
        expect(Utils.logError).toHaveBeenCalledWith('GameComponent', errorMessage, errorData);
    }));

    for (const gameInfo of GameInfo.getAllGames()) {
        it(`should have an encoder, tutorial and AI for ${ gameInfo.name }`, fakeAsync(async() => {
            // Given a game
            activatedRouteStub.setRoute('game', gameInfo.urlName);
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
            const aiCount: number = component.aiConfig.minimax.length + component.aiConfig.mcts.length;
            expect(aiCount).withContext('AI list empty for ' + gameInfo.urlName).toBeGreaterThan(0);
        }));

        it(`should have valid declarative AI configs for ${ gameInfo.name }`, fakeAsync(async() => {
            // Given a game
            activatedRouteStub.setRoute('game', gameInfo.urlName);
            const testUtils: ComponentTestUtils<AbstractGameComponent> =
                await ComponentTestUtils.forGame(gameInfo.urlName);
            const component: AbstractGameComponent = testUtils.getGameComponent();
            testUtils.detectChanges();
            tick(0);

            // Then minimax configs should be complete and directly instantiable
            for (const config of component.aiConfig.minimax) {
                expect(config.id).withContext('minimax config id missing for ' + gameInfo.urlName).toBeTruthy();
                expect(config.name).withContext('minimax config name missing for ' + gameInfo.urlName).toBeTruthy();
                expect(config.id).withContext('minimax config id should name the heuristic for ' + gameInfo.urlName)
                    .not.toContain('Minimax');
                expect(config.name).withContext('minimax config name should name the heuristic for ' + gameInfo.urlName)
                    .not.toContain('Minimax');
                expect(config.heuristic).withContext('heuristic missing for ' + config.name).toBeDefined();
                expect(config.moveGenerator).withContext('moveGenerator missing for ' + config.name).toBeDefined();
                const heuristic: Heuristic<Move, GameState, BoardValue, RulesConfig> = config.heuristic!();
                const moveGenerator: MoveGenerator<Move, GameState, RulesConfig> = config.moveGenerator!();
                const moves: Move[] = moveGenerator.getListMoves(component.node(), component.config());
                expect(moves.length)
                    .withContext('minimax moveGenerator returned no move for ' + gameInfo.urlName + '/' + config.name)
                    .toBeGreaterThan(0);
                const boardValue: BoardValue = heuristic.getBoardValue(component.node(), component.config());
                expect(boardValue.metrics.length)
                    .withContext('heuristic returned no metric for ' + gameInfo.urlName + '/' + config.name)
                    .toBeGreaterThan(0);
                const minimax: Minimax<Move, GameState, RulesConfig, unknown> =
                    createConfiguredMinimaxForTest(component.rules, config);
                expect(minimax.availableOptions.length)
                    .withContext('minimax options missing for ' + gameInfo.urlName + '/' + config.name)
                    .toBeGreaterThan(0);
            }

            // And MCTS configs should be complete and directly instantiable
            for (const config of component.aiConfig.mcts) {
                expect(config.id).withContext('MCTS config id missing for ' + gameInfo.urlName).toBeTruthy();
                expect(config.name).withContext('MCTS config name missing for ' + gameInfo.urlName).toBeTruthy();
                const moveGenerator: MoveGenerator<Move, GameState, RulesConfig> = config.moveGenerator();
                expect(moveGenerator).withContext('MCTS moveGenerator missing for ' + config.name).toBeDefined();
                const moves: Move[] = moveGenerator.getListMoves(component.node(), component.config());
                expect(moves.length)
                    .withContext('MCTS moveGenerator returned no move for ' + gameInfo.urlName + '/' + config.name)
                    .toBeGreaterThan(0);
                const mcts: MCTS<Move, GameState, RulesConfig, unknown> = createMCTSFromConfig(component.rules, config);
                expect(mcts).withContext('MCTS config could not be instantiated for ' + config.name).toBeDefined();
            }
        }));

        SlowTest.it(`should support bounded self-play for all minimax profiles of ${ gameInfo.name }`, fakeAsync(async() => {
            activatedRouteStub.setRoute('game', gameInfo.urlName);
            const testUtils: ComponentTestUtils<AbstractGameComponent> =
                await ComponentTestUtils.forGame(gameInfo.urlName);
            const component: AbstractGameComponent = testUtils.getGameComponent();
            testUtils.detectChanges();
            tick(0);

            for (const config of component.aiConfig.minimax) {
                const minimax: Minimax<Move, GameState, RulesConfig, unknown> =
                    createConfiguredMinimaxForTest(component.rules, config);
                const options: AIDepthLimitOptions = getShallowestMinimaxOptions(minimax);

                expectToBeAbleToPlayAgainstItself({
                    rules: component.rules,
                    playerZeroMinimax: minimax,
                    playerZeroOptions: options,
                    config: component.config(),
                    maxPlies: UNIVERSAL_SELF_PLAY_PLIES,
                    maxDurationMillis: 10000,
                });
            }
        }));
    }

});
