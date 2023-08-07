/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { SixState } from '../SixState';
import { SixMove } from '../SixMove';
import { SixNode } from '../SixRules';
import { SixHeuristic, SixMinimax, SixMoveGenerator, SixReducedMoveGenerator } from '../SixMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Table } from 'src/app/utils/ArrayUtils';
import { AIDepthLimitOptions } from 'src/app/jscaip/MGPNode';
import { BoardValue } from 'src/app/jscaip/BoardValue';

const O: PlayerOrNone = Player.ZERO;
const X: PlayerOrNone = Player.ONE;
const _: PlayerOrNone = PlayerOrNone.NONE;

describe('SixMoveGenerator', () => {

    let moveGenerator: SixMoveGenerator;

    beforeEach(() => {
        moveGenerator = new SixMoveGenerator();
    });

    it(`should propose all movements`, () => {
        // Given an board where all piece are blocked
        const board: Table<PlayerOrNone> = [
            [O, X, X, X, X, X, O],
        ];
        const state: SixState = SixState.ofRepresentation(board, 40);
        const node: SixNode = new SixNode(state);

        // When listing the choices
        const choices: SixMove[] = moveGenerator.getListMoves(node);

        // Then there should be all the possibilities
        // 2 starting positions * 15 possible ends
        expect(choices.length).toBe(30);
    });
});

describe('SixReducedMoveGenerator', () => {

    let moveGenerator: SixReducedMoveGenerator;

    beforeEach(() => {
        moveGenerator = new SixReducedMoveGenerator();
    });
    it(`should propose only one starting piece when all piece are blocking an opponent's victory (lines)`, () => {
        // Given an initial board where all piece are blocked but there is a forcing move
        const board: Table<PlayerOrNone> = [
            [_, _, _, O, O, O, _],
            [O, X, X, X, X, X, _],
            [O, X, X, X, X, X, O],
            [_, O, O, O, _, _, _],
        ];
        const state: SixState = SixState.ofRepresentation(board, 40);
        const node: SixNode = new SixNode(state);

        // When listing the choices
        const choices: SixMove[] = moveGenerator.getListMoves(node);

        // Then there should be only one starting piece
        const startingCoord: Coord = choices[0].start.get();
        expect(choices.every((move: SixMove) => move.start.equalsValue(startingCoord))).toBeTrue();
    });
    it(`should propose only one starting piece when all piece are blocking an opponent's victory (triangle)`, () => {
        // Given an initial board where all piece are blocked but there is a forcing move
        const board: Table<PlayerOrNone> = [
           [_, X, X, _],
           [_, O, X, O],
           [X, X, X, _],
        ];
        const state: SixState = SixState.ofRepresentation(board, 40);
        const node: SixNode = new SixNode(state);

        // When listing the choices
        const choices: SixMove[] = moveGenerator.getListMoves(node);

        // Then there should be only one starting piece
        const startingCoord: Coord = choices[0].start.get();
        expect(choices.every((move: SixMove) => move.start.equalsValue(startingCoord))).toBeTrue();
    });
    it(`should propose only one starting piece when all piece are blocking an opponent's victory (circle)`, () => {
        // Given an initial board where all piece are blocked but there is a forcing move
        const board: Table<PlayerOrNone> = [
           [_, X, X, _],
           [O, _, X, _],
           [X, X, O, _],
        ];
        const state: SixState = SixState.ofRepresentation(board, 40);
        const node: SixNode = new SixNode(state);

        // When listing the choices
        const choices: SixMove[] = moveGenerator.getListMoves(node);

        // Then there should be only one starting piece
        const startingCoord: Coord = choices[0].start.get();
        expect(choices.every((move: SixMove) => move.start.equalsValue(startingCoord))).toBeTrue();
    });
    it('should give all possible drops in phase 1', () => {
        // Given a game state in phase 1
        const state: SixState = SixState.ofRepresentation([
            [O],
        ], 1);
        const node: SixNode = new SixNode(state);

        // When calculating the list of moves
        const listMoves: SixMove[] = moveGenerator.getListMoves(node);

        // Then the list should have all the possible drops and only them
        expect(listMoves.every((move: SixMove) => move.isDrop())).toBeTrue();
        expect(listMoves.length).toBe(6); // One for each neighbors
    });
    it('should pass possible movement when Phase 2', () => {
        // Given a game state in phase 2
        const state: SixState = SixState.ofRepresentation([
            [O, O, O, X, X, X],
            [O, O, O, X, X, X],
        ], 42);
        const node: SixNode = new SixNode(state);

        // When calculating the list of moves
        const listMoves: SixMove[] = moveGenerator.getListMoves(node);

        // Then the list should have all the possible moves and only them
        expect(listMoves.every((move: SixMove) => move.isDrop())).toBeFalse();
    });
    it('should include cutting move as well', () => {
        // Given a game state in phase 2
        const state: SixState = SixState.ofRepresentation([
            [O, O, X, O, X, X, O, X, _],
            [X, X, O, X, _, O, X, O, O],
        ], 43);
        const node: SixNode = new SixNode(state);

        // When calculating the list of moves
        const listMoves: SixMove[] = moveGenerator.getListMoves(node);

        // Then the list should have all the possible moves and only them
        const cuttingMove: SixMove = SixMove.ofCut(new Coord(4, 0), new Coord(8, 0), new Coord(0, 0));
        expect(listMoves.some((move: SixMove) => move.equals(cuttingMove))).toBeTrue();
    });
});

describe('SixHeuristic', () => {

    let heuristic: SixHeuristic;

    beforeEach(() => {
        heuristic = new SixHeuristic();
    });
    describe('pre-victories', () => {
        it('should only count one preVictory when one coord is a forcing move for two lines', () => {
            // Given a node with two pre-victories
            const board: Table<PlayerOrNone> = [
                [_, _, X, _, _, X],
                [_, _, O, _, O, _],
                [_, _, O, O, _, _],
                [_, _, O, _, _, O],
                [_, O, O, _, O, X],
                [O, _, O, O, X, X],
            ];
            const state: SixState = SixState.ofRepresentation(board, 9);
            const move: SixMove = SixMove.ofDrop(new Coord(2, 3));
            const node: SixNode = new SixNode(state, MGPOptional.empty(), MGPOptional.of(move));

            // When evaluation its value
            const boardValue: BoardValue = heuristic.getBoardValue(node);

            // Then that value should be a pre-victory
            expect(boardValue.value).toBe(Player.ZERO.getPreVictory());
        });
    });
    describe('4 pieces aligned is better than 3 pieces aligned', () => {
        it('should be true with lines', () => {
            const move: SixMove = SixMove.ofDrop(new Coord(1, 1));
            const weakerState: SixState = SixState.ofRepresentation([
                [O, O, _, _, _],
                [X, X, X, _, _],
                [O, O, _, _, _],
            ], 7);
            const strongerState: SixState = SixState.ofRepresentation([
                [O, O, _, _, _],
                [X, X, X, X, _],
                [O, O, _, _, _],
            ], 7);
            RulesUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakerState, MGPOptional.of(move),
                                                               strongerState, MGPOptional.of(move),

                                                               Player.ONE);
        });
        it('should be true with triangle', () => {
            const move: SixMove = SixMove.ofDrop(new Coord(1, 3));
            const weakerState: SixState = SixState.ofRepresentation([
                [_, _, _],
                [X, _, _],
                [X, _, O],
                [X, O, _],
            ], 7);
            const strongerState: SixState = SixState.ofRepresentation([
                [_, _, _],
                [X, _, X],
                [X, _, O],
                [X, O, _],
            ], 7);
            RulesUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakerState, MGPOptional.of(move),
                                                               strongerState, MGPOptional.of(move),
                                                               Player.ONE);
        });
        it('should be true with circle', () => {
            const move: SixMove = SixMove.ofDrop(new Coord(2, 1));
            const weakerState: SixState = SixState.ofRepresentation([
                [_, X, X],
                [_, O, X],
                [_, _, _],
            ], 7);
            const strongerState: SixState = SixState.ofRepresentation([
                [_, X, X],
                [_, O, X],
                [_, X, _],
            ], 7);
            RulesUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakerState, MGPOptional.of(move),
                                                               strongerState, MGPOptional.of(move),
                                                               Player.ONE);
        });
    });
    describe('4 pieces aligned with two spaces should be better than 4 aligned with two opponents', () => {
        it('should be true with lines', () => {
            const move: SixMove = SixMove.ofDrop(new Coord(1, 1));
            const weakerState: SixState = SixState.ofRepresentation([
                [O, O, O, O, O, O],
                [O, X, X, X, X, O],
                [O, O, O, O, O, O],
            ], 7);
            const strongerState: SixState = SixState.ofRepresentation([
                [O, O, O, O, O, O],
                [_, X, X, X, X, _],
                [O, O, O, O, O, O],
            ], 7);
            RulesUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakerState, MGPOptional.of(move),
                                                               strongerState, MGPOptional.of(move),
                                                               Player.ONE);
        });
    });
    it('Score after 40th turn should be a subtraction of the number of piece', () => {
        const state: SixState = SixState.ofRepresentation([
            [X, X, X, X, O, O, O, O, O],
            [X, X, X, X, O, O, O, O, O],
        ], 40);
        const move: SixMove = SixMove.ofDrop(new Coord(1, 1));
        const node: SixNode = new SixNode(state, MGPOptional.empty(), MGPOptional.of(move));
        expect(heuristic.getBoardValue(node).value).toBe(2);
    });
});

describe('SixMinimax', () => {

    let minimax: SixMinimax;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };

    beforeEach(() => {
        minimax = new SixMinimax();
    });
    it('should not consider moving piece that are blocking an opponent victory', () => {
        // Given a board with only one non losing move
        const board: Table<PlayerOrNone> = [
            [O, O, _, _, _, _, O],
            [X, _, _, _, _, X, _],
            [X, _, _, O, X, X, _],
            [X, X, O, X, X, O, _],
            [X, _, X, X, O, _, _],
            [_, X, _, _, _, _, _],
        ];
        const state: SixState = SixState.ofRepresentation(board, 40);
        const node: SixNode = new SixNode(state);

        // When asking the minimax the best choice
        const bestMove: SixMove = minimax.chooseNextMove(node, minimaxOptions);
        expect(bestMove.start.get()).toEqual(new Coord(1, 0));
    });
});
