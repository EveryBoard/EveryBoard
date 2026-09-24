/* eslint-disable max-lines-per-function */
import { AIDepthLimitOptions, AIOptions } from '@everyboard/games';
import { MinimaxConfig } from '@everyboard/games';
import { createMinimaxFromConfig } from '@everyboard/games';
import { GameNode, GameNodeStats } from '@everyboard/games';
import { Minimax } from '@everyboard/games';
import { Move } from '@everyboard/games';
import { Player } from '@everyboard/games';
import { SuperRules } from '@everyboard/games';
import { RulesConfig } from '@everyboard/games';
import { GameState } from '@everyboard/games';
import { MGPFallible, Utils } from '@everyboard/lib';

import { TestVars } from '../../TestVars.spec';

const regularIt: (name: string, testBody: () => void) => void = it;
const regularFit: (name: string, testBody: () => void) => void = fit;
const regularXit: (name: string, testBody: () => void) => void = xit;
export namespace SlowTest {

    // Run a slow test, only if that option is enabled
    export function it(name: string, testBody: () => void): void {
        if (TestVars.slowTests) {
            regularIt(name, testBody);
        } else {
            // Instead of doing nothing when slow tests are disabled, which would result in a potential karma error
            // ("describe without it"), we use xit
            regularXit(name, testBody);
        }
    }

    // Does a focused test (a fit), and ignores the TestVars.slowTests option
    export function fit(name: string, testBody: () => void): void {
        regularFit(name, testBody);
    }

}

export const UNIVERSAL_SELF_PLAY_PLIES: number = 24;

export type MinimaxTestOptions<R extends SuperRules<M, S, C, L>,
                               M extends Move,
                               S extends GameState,
                               O extends AIOptions,
                               C extends RulesConfig,
                               L> = {
    rules: R;
    minimax: Minimax<M, S, C, L>;
    options: O;
    config: C;
    shouldFinish: boolean;
}

export type BoundedMinimaxTestOptions<R extends SuperRules<M, S, C, L>,
                                      M extends Move,
                                      S extends GameState,
                                      O extends AIDepthLimitOptions,
                                      C extends RulesConfig,
                                      L> = {
    rules: R;
    playerZeroMinimax: Minimax<M, S, C, L>;
    playerZeroOptions: O;
    playerOneMinimax?: Minimax<M, S, C, L>;
    playerOneOptions?: O;
    config: C;
    maxPlies: number;
    maxDurationMillis: number;
}

/* Run a minimax test by battling it against itself for a number of turns */
export function minimaxTest<R extends SuperRules<M, S, C, L>,
                            M extends Move,
                            S extends GameState,
                            O extends AIDepthLimitOptions,
                            C extends RulesConfig,
                            L>(options: MinimaxTestOptions<R, M, S, O, C, L>): void
{
    // Given a component where AI plays against AI
    let node: GameNode<M, S> = options.rules.getInitialNode(options.config);
    const limit: number = 10000; // Play for 10 seconds at most

    // When playing the needed number of turns
    // Then it should not throw errors
    let turn: number = 0;
    const start: number = performance.now();
    const nodesBefore: number = GameNodeStats.createdNodes;
    while (performance.now() < start + limit && options.rules.getGameStatus(node, options.config).isEndGame === false) {
        const bestMove: M = options.minimax.chooseNextMove(node, options.options, options.config);
        expect(bestMove).toBeDefined();
        const nextNode: MGPFallible<GameNode<M, S>> = options.rules.choose(node, bestMove, options.config);
        expect(nextNode.isSuccess()).withContext(`${options.minimax.name} should choose a legal move at turn ${turn}`).toBeTrue();
        node = nextNode.get();
        turn++;
    }
    const seconds: number = (performance.now() - start) / 1000;
    const nodesCreated: number = GameNodeStats.createdNodes - nodesBefore;
    console.log(`${turn / seconds} turn/s for ${options.minimax.constructor.name} with ${turn} turns in ${seconds} seconds, created ${nodesCreated} nodes, so ${nodesCreated / seconds} nodes/s`);
    // And maybe the game needs to be over
    if (options.shouldFinish) {
        expect(options.rules.getGameStatus(node, options.config).isEndGame).toBeTrue();
    }
}

export function expectToBeAbleToPlayAgainstItself<R extends SuperRules<M, S, C, L>,
                                                  M extends Move,
                                                  S extends GameState,
                                                  O extends AIDepthLimitOptions,
                                                  C extends RulesConfig,
                                                  L>(options: BoundedMinimaxTestOptions<R, M, S, O, C, L>): void {
    let node: GameNode<M, S> = options.rules.getInitialNode(options.config);
    const playerOneMinimax: Minimax<M, S, C, L> = options.playerOneMinimax ?? options.playerZeroMinimax;
    const playerOneOptions: O = options.playerOneOptions ?? options.playerZeroOptions;
    const deadline: number = performance.now() + options.maxDurationMillis;

    for (let ply: number = 0; ply < options.maxPlies && performance.now() < deadline; ply++) {
        if (options.rules.getGameStatus(node, options.config).isEndGame) {
            return;
        }
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        const minimax: Minimax<M, S, C, L> =
            currentPlayer === Player.ZERO ? options.playerZeroMinimax : playerOneMinimax;
        const aiOptions: O = currentPlayer === Player.ZERO ? options.playerZeroOptions : playerOneOptions;
        const move: M = minimax.chooseNextMove(node, aiOptions, options.config);
        expect(move).withContext(`${minimax.name} should choose a move at ply ${ply}`).toBeDefined();
        const nextNode: MGPFallible<GameNode<M, S>> = options.rules.choose(node, move, options.config);
        expect(nextNode.isSuccess()).withContext(`${minimax.name} should choose a legal move at ply ${ply}`).toBeTrue();
        node = nextNode.get();
    }
}

export function getShallowestMinimaxOptions<M extends Move,
                                            S extends GameState,
                                            C extends RulesConfig,
                                            L>(minimax: Minimax<M, S, C, L>): AIDepthLimitOptions
{
    const options: AIOptions[] = minimax.availableOptions as AIOptions[];
    const depthOptions: AIDepthLimitOptions[] = options.filter((option: AIOptions): option is AIDepthLimitOptions => {
        return 'maxDepth' in option;
    });
    Utils.assert(depthOptions.length > 0, `Minimax ${minimax.name} should expose at least one depth-limited option`);
    return depthOptions.reduce((best: AIDepthLimitOptions, option: AIDepthLimitOptions) => {
        return option.maxDepth < best.maxDepth ? option : best;
    });
}

export function createConfiguredMinimaxForTest<R extends SuperRules<M, S, C, L>,
                                               M extends Move,
                                               S extends GameState,
                                               C extends RulesConfig,
                                               L>(rules: R,
                                                  config: MinimaxConfig<M, S, C>)
: Minimax<M, S, C, L>
{
    return createMinimaxFromConfig(rules, config);
}
