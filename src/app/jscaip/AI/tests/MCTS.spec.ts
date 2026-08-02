/* eslint-disable max-lines-per-function */
import { AwaleMoveGenerator } from '../../../games/mancala/awale/AwaleMoveGenerator';
import { AwaleRules } from '../../../games/mancala/awale/AwaleRules';
import { MancalaConfig } from '../../../games/mancala/common/MancalaConfig';
import { MancalaMove } from '../../../games/mancala/common/MancalaMove';
import { MancalaNode } from '../../../games/mancala/common/MancalaRules';
import { MancalaState } from '../../../games/mancala/common/MancalaState';
import { P4Heuristic } from '../../../games/p4/P4Heuristic';
import { P4Move } from '../../../games/p4/P4Move';
import { P4MoveGenerator } from '../../../games/p4/P4MoveGenerator';
import { P4Config, P4Node, P4Rules } from '../../../games/p4/P4Rules';
import { P4State } from '../../../games/p4/P4State';
import { QuartoMove } from '../../../games/quarto/QuartoMove';
import { QuartoMoveGenerator } from '../../../games/quarto/QuartoMoveGenerator';
import { QuartoPiece } from '../../../games/quarto/QuartoPiece';
import { QuartoConfig, QuartoNode, QuartoRules } from '../../../games/quarto/QuartoRules';
import { QuartoState } from '../../../games/quarto/QuartoState';
import { Coord } from '../../Coord';
import { GameStatus } from '../../GameStatus';
import { Player } from '../../Player';
import { Table } from '../../TableUtils';
import { AITimeLimitOptions } from '../AI';
import { BoardValue } from '../BoardValue';
import { GameNode } from '../GameNode';
import { MCTS } from '../MCTS';
import { MCTSWithHeuristic } from '../MCTSWithHeuristic';
import { HeuristicBounds } from '../Minimax';

class TestMCTSWithHeuristic extends MCTSWithHeuristic<P4Move, P4State, P4Config> {

    public getScore(node: P4Node, config: P4Config, gameStatus: GameStatus, player: Player) : number {
        return this.score(node, config, gameStatus, player);
    }

}

class NeutralMetricP4Heuristic extends P4Heuristic {

    public override getBoardValue(_node: P4Node, config: P4Config): BoardValue {
        return this.getBounds(config).player0Best;
    }

    public override getBounds(config: P4Config): HeuristicBounds<BoardValue> {
        const neutralValue: number = super.getBounds(config).player0Best.metrics[0];
        return {
            player0Best: BoardValue.of(neutralValue),
            player1Best: BoardValue.of(neutralValue),
        };
    }

}

describe('MCTS', () => {

    let mcts: MCTS<QuartoMove, QuartoState, QuartoConfig>;
    const mctsOptions: AITimeLimitOptions = { name: '200ms', maxSeconds: 0.2 };
    const defaultConfig: QuartoConfig = QuartoRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        mcts = new MCTS('MCTS', new QuartoMoveGenerator(), QuartoRules.get());
    });

    it('should choose possible victory over definite defeat', () => {
        // Given a board that could be a win for opponent in their next moves
        const board: Table<QuartoPiece> = [
            [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABB, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 14, QuartoPiece.BBAA);
        const node: QuartoNode = new QuartoNode(state);

        // When computing the best move
        const move: QuartoMove = mcts.chooseNextMove(node, mctsOptions, defaultConfig);
        // Then it should not give the win to the opponent
        if (move.coord.equals(new Coord(3, 0))) {
            // MCTS blocked the opponent's only possible win
            expect(true).toBe(true);
        } else {
            expect(move.piece)
                .withContext('MCTS gave the opponent a piece with which they can win (while other option exist)')
                .not.toEqual(QuartoPiece.AABA);
        }
    });

    it('should know how to win multiple turns in advance', () => {
        // Given a board where we have to make a choice between definitely losing or possibly winning,
        // but multiple turns in advance
        const board: Table<QuartoPiece> = [
            [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABA, QuartoPiece.EMPTY],
            [QuartoPiece.BABB, QuartoPiece.BAAB, QuartoPiece.ABAA, QuartoPiece.BBAB],
            [QuartoPiece.ABBA, QuartoPiece.BBAA, QuartoPiece.BABA, QuartoPiece.EMPTY],
            [QuartoPiece.AABB, QuartoPiece.ABBB, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 12, QuartoPiece.BBBB);
        const node: QuartoNode = new QuartoNode(state);
        // When computing the best move
        const move: QuartoMove = mcts.chooseNextMove(node, mctsOptions, defaultConfig);
        // Then it should choose the move that leads to the wins
        expect(move).toEqual(new QuartoMove(3, 0, QuartoPiece.ABAB));
    });

    it('should not fail on games that are too long', () => {
        // Given a MCTS for a game that has a tendency to give long random games
        const otherMcts: MCTS<MancalaMove, MancalaState, MancalaConfig> = new MCTS('MCTS', new AwaleMoveGenerator(), AwaleRules.get());
        otherMcts.maxGameLength = 10; // Limit it heavily to ensure we will exhaust the limit (for coverage)
        // When searching for the best move
        const beforeSearch: number = Date.now();
        const config: MancalaConfig = AwaleRules.get().getDefaultRulesConfig();
        const node: MancalaNode = AwaleRules.get().getInitialNode(config);
        const move: MancalaMove = otherMcts.chooseNextMove(node, mctsOptions, config);
        // Then it should find one and not get stuck infinitely
        expect(move).toBeTruthy();
        // Add 10% to allow for iterations to finish
        expect(Date.now() - beforeSearch).toBeLessThan(1000 * (mctsOptions.maxSeconds + 0.1));
    });

    it('should choose a move even with very little time', () => {
        // This test is there for coverage as well, to check that having unexplored moves does not break MCTS
        // Given 1ms allowed for MCTS
        const noTimeOptions: AITimeLimitOptions = { name: '1ms', maxSeconds: 0.001 };
        // When searching for a move
        const node: QuartoNode = QuartoRules.get().getInitialNode(defaultConfig);
        const move: QuartoMove = mcts.chooseNextMove(node, noTimeOptions, defaultConfig);
        // Then it should have selected a move
        expect(move).toBeTruthy();
    });

    it('should score heuristic values from the searched player viewpoint', () => {
        // Given a heuristic board value that is best for Player.ONE
        const p4Config: P4Config = P4Rules.get().getDefaultRulesConfig();
        const node: P4Node = P4Rules.get().getInitialNode(p4Config);
        const heuristic: P4Heuristic = new P4Heuristic();
        spyOn(heuristic, 'getBoardValue').and.returnValue(heuristic.getBounds(p4Config).player1Best);
        const p4Mcts: TestMCTSWithHeuristic =
            new TestMCTSWithHeuristic('MCTS', new P4MoveGenerator(), P4Rules.get(), heuristic);

        // When scoring this board for both players
        const playerZeroScore: number = p4Mcts.getScore(node, p4Config, GameStatus.ONGOING, Player.ZERO);
        const playerOneScore: number = p4Mcts.getScore(node, p4Config, GameStatus.ONGOING, Player.ONE);

        // Then it should be good for Player.ONE and bad for Player.ZERO
        expect(playerZeroScore).toBe(0);
        expect(playerOneScore).toBe(1);
    });

    it('should clamp heuristic values below their bounds', () => {
        // Given a heuristic value below the declared lower bound
        const p4Config: P4Config = P4Rules.get().getDefaultRulesConfig();
        const node: P4Node = P4Rules.get().getInitialNode(p4Config);
        const heuristic: P4Heuristic = new P4Heuristic();
        const valueBelowLowerBound: number = heuristic.getBounds(p4Config).player0Best.metrics[0] - 1;
        spyOn(heuristic, 'getBoardValue').and.returnValue(BoardValue.of(valueBelowLowerBound));
        const p4Mcts: TestMCTSWithHeuristic =
            new TestMCTSWithHeuristic('MCTS', new P4MoveGenerator(), P4Rules.get(), heuristic);
        spyOn(console, 'warn');

        // When scoring it
        const playerZeroScore: number = p4Mcts.getScore(node, p4Config, GameStatus.ONGOING, Player.ZERO);
        const playerOneScore: number = p4Mcts.getScore(node, p4Config, GameStatus.ONGOING, Player.ONE);

        // Then it should be capped to the lower bound and remain a valid win score
        expect(playerZeroScore).toBe(1);
        expect(playerOneScore).toBe(0);
    });

    it('should score finished games without using the heuristic', () => {
        // Given an MCTS with heuristic
        const p4Config: P4Config = P4Rules.get().getDefaultRulesConfig();
        const node: P4Node = P4Rules.get().getInitialNode(p4Config);
        const heuristic: P4Heuristic = new P4Heuristic();
        spyOn(heuristic, 'getBoardValue').and.returnValue(heuristic.getBounds(p4Config).player1Best);
        const p4Mcts: TestMCTSWithHeuristic =
            new TestMCTSWithHeuristic('MCTS', new P4MoveGenerator(), P4Rules.get(), heuristic);

        // When scoring a terminal status
        const score: number = p4Mcts.getScore(node, p4Config, GameStatus.ZERO_WON, Player.ZERO);

        // Then it should delegate to the regular MCTS win score
        expect(score).toBe(1);
    });

    it('should score equal heuristic bounds as neutral', () => {
        // Given a heuristic whose lower and upper bounds are identical
        const p4Config: P4Config = P4Rules.get().getDefaultRulesConfig();
        const node: P4Node = P4Rules.get().getInitialNode(p4Config);
        const heuristic: NeutralMetricP4Heuristic = new NeutralMetricP4Heuristic();
        const p4Mcts: TestMCTSWithHeuristic =
            new TestMCTSWithHeuristic('MCTS', new P4MoveGenerator(), P4Rules.get(), heuristic);

        // When scoring an ongoing board
        const playerZeroScore: number = p4Mcts.getScore(node, p4Config, GameStatus.ONGOING, Player.ZERO);
        const playerOneScore: number = p4Mcts.getScore(node, p4Config, GameStatus.ONGOING, Player.ONE);

        // Then both players should get a neutral score
        expect(playerZeroScore).toBe(0.5);
        expect(playerOneScore).toBe(0.5);
    });

    it('should select opponent children that are bad for the searched player', () => {
        // Given a node where it is Player.ONE's turn, with two already explored replies
        const p4Config: P4Config = P4Rules.get().getDefaultRulesConfig();
        const p4Mcts: MCTS<P4Move, P4State, P4Config> = new MCTS('MCTS', new P4MoveGenerator(), P4Rules.get());
        const root: P4Node = P4Rules.get().getInitialNode(p4Config);
        const playerZeroMove: P4Node = p4Mcts['play'](root, P4Move.of(0), p4Config) as P4Node;
        const goodForPlayerZero: P4Node = p4Mcts['play'](playerZeroMove, P4Move.of(0), p4Config) as P4Node;
        const badForPlayerZero: P4Node = p4Mcts['play'](playerZeroMove, P4Move.of(1), p4Config) as P4Node;
        playerZeroMove.addChild(goodForPlayerZero);
        playerZeroMove.addChild(badForPlayerZero);
        p4Mcts['addSimulationResult'](playerZeroMove, 0);
        for (let i: number = 0; i < 10; i++) {
            p4Mcts['addSimulationResult'](goodForPlayerZero, 1);
            p4Mcts['addSimulationResult'](badForPlayerZero, 0);
        }

        // When selecting from the opponent turn
        const selected: { node: GameNode<P4Move, P4State>, path: GameNode<P4Move, P4State>[] } =
            p4Mcts['select']({ node: playerZeroMove, path: [playerZeroMove] }, Player.ZERO);

        // Then the opponent should be modeled as choosing the reply that minimizes Player.ZERO's score
        expect(selected.node).toBe(badForPlayerZero);
    });

});
