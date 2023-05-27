/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { SixState } from '../SixState';
import { SixMove } from '../SixMove';
import { SixNode, SixRules } from '../SixRules';
import { SixMinimax, SixBoardValue } from '../SixMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Table } from 'src/app/utils/ArrayUtils';

describe('SixMinimax', () => {

    let rules: SixRules;
    let minimax: SixMinimax;

    const O: PlayerOrNone = Player.ZERO;
    const X: PlayerOrNone = Player.ONE;
    const _: PlayerOrNone = PlayerOrNone.NONE;

    beforeEach(() => {
        rules = SixRules.get();
        minimax = new SixMinimax(rules, 'SixMinimax');
    });
    describe('pre-victories', () => {
        it('should created pre-victory when evaluating board value', () => {
            // Given a node with one pre-victory and the node having a last move
            const board: Table<PlayerOrNone> = [
                [X, _, _, _, _, _, X],
                [O, _, _, _, _, O, _],
                [O, _, _, _, O, _, _],
                [O, X, X, O, X, _, _],
                [O, _, O, X, _, _, _],
                [_, O, X, X, _, _, _],
                [_, X, _, _, _, _, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 11);
            const lastMove: SixMove = SixMove.ofDrop(new Coord(1, 5));
            const node: SixNode = new SixNode(state, MGPOptional.empty(), MGPOptional.of(lastMove));

            // When evaluating the board value
            const boardValue: SixBoardValue = minimax.getBoardValue(node);

            // Then it should have a pre-victory
            expect(boardValue.preVictory).toEqual(MGPOptional.of(new Coord(0, 6)));
        });
        it('should pass forcing move to children node to minimise calculations', () => {
            // Given a node with one pre-victory and the node having a last move
            const board: Table<PlayerOrNone> = [
                [X, _, _, _, _, _, X],
                [O, _, _, _, _, O, _],
                [O, _, _, _, O, _, _],
                [O, X, X, O, X, _, _],
                [O, _, O, X, _, _, _],
                [_, O, X, X, _, _, _],
                [_, X, _, _, _, _, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 11);
            const lastMove: SixMove = SixMove.ofDrop(new Coord(1, 5));
            const node: SixNode = new SixNode(state, MGPOptional.empty(), MGPOptional.of(lastMove));
            minimax.getBoardValue(node);

            // When calculating its children, there should only be one
            const chosenMove: SixMove = node.findBestMove(1, minimax);
            expect(chosenMove).toEqual(SixMove.ofDrop(new Coord(0, 6)));
            expect(node.countDescendants()).toBe(1);
        });
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
            const state: SixState = SixState.fromRepresentation(board, 9);
            const move: SixMove = SixMove.ofDrop(new Coord(2, 3));
            const node: SixNode = new SixNode(state, MGPOptional.empty(), MGPOptional.of(move));

            // When evaluation its value
            const boardValue: SixBoardValue = minimax.getBoardValue(node);

            // Then that value should countain a pre-victory
            expect(boardValue.preVictory).toEqual(MGPOptional.of(new Coord(-1, 6)));
            expect(boardValue.value).toBe(Player.ZERO.getPreVictory());
        });
        it('should point the right preVictory coord with circle', () => {
            const board: Table<PlayerOrNone> = [
                [_, O, _, X],
                [O, _, O, _],
                [O, O, _, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 9);
            const move: SixMove = SixMove.ofDrop(new Coord(1, 0));
            const node: SixNode = new SixNode(state, MGPOptional.empty(), MGPOptional.of(move));
            const boardValue: SixBoardValue = minimax.getBoardValue(node);
            expect(boardValue.preVictory.equalsValue(new Coord(2, 0))).toBeTrue();
        });
    });
    describe('4 pieces aligned is better than 3 pieces aligned', () => {
        it('should be true with lines', () => {
            const move: SixMove = SixMove.ofDrop(new Coord(1, 1));
            const weakerState: SixState = SixState.fromRepresentation([
                [O, O, _, _, _],
                [X, X, X, _, _],
                [O, O, _, _, _],
            ], 7);
            const strongerState: SixState = SixState.fromRepresentation([
                [O, O, _, _, _],
                [X, X, X, X, _],
                [O, O, _, _, _],
            ], 7);
            RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                               weakerState, MGPOptional.of(move),
                                                               strongerState, MGPOptional.of(move),

                                                               Player.ONE);
        });
        it('should be true with triangle', () => {
            const move: SixMove = SixMove.ofDrop(new Coord(1, 3));
            const weakerState: SixState = SixState.fromRepresentation([
                [_, _, _],
                [X, _, _],
                [X, _, O],
                [X, O, _],
            ], 7);
            const strongerState: SixState = SixState.fromRepresentation([
                [_, _, _],
                [X, _, X],
                [X, _, O],
                [X, O, _],
            ], 7);
            RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                               weakerState, MGPOptional.of(move),
                                                               strongerState, MGPOptional.of(move),
                                                               Player.ONE);
        });
        it('should be true with circle', () => {
            const move: SixMove = SixMove.ofDrop(new Coord(2, 1));
            const weakerState: SixState = SixState.fromRepresentation([
                [_, X, X],
                [_, O, X],
                [_, _, _],
            ], 7);
            const strongerState: SixState = SixState.fromRepresentation([
                [_, X, X],
                [_, O, X],
                [_, X, _],
            ], 7);
            RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                               weakerState, MGPOptional.of(move),
                                                               strongerState, MGPOptional.of(move),
                                                               Player.ONE);
        });
    });
    describe('4 pieces aligned with two spaces should be better than 4 aligned with two opponents', () => {
        it('should be true with lines', () => {
            const move: SixMove = SixMove.ofDrop(new Coord(1, 1));
            const weakerState: SixState = SixState.fromRepresentation([
                [O, O, O, O, O, O],
                [O, X, X, X, X, O],
                [O, O, O, O, O, O],
            ], 7);
            const strongerState: SixState = SixState.fromRepresentation([
                [O, O, O, O, O, O],
                [_, X, X, X, X, _],
                [O, O, O, O, O, O],
            ], 7);
            RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                               weakerState, MGPOptional.of(move),
                                                               strongerState, MGPOptional.of(move),
                                                               Player.ONE);
        });
    });
    describe('Phase 2', () => {
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
            const state: SixState = SixState.fromRepresentation(board, 40);
            const node: SixNode = new SixNode(state);

            // When asking the minimax the best choice
            const bestMove: SixMove = node.findBestMove(1, minimax);
            expect(bestMove.start.get()).toEqual(new Coord(1, 0));
        });
        it(`should propose only one starting piece when all piece are blocking an opponent's victory`, () => {
            // Given an initial board where all piece are blocked but there is a forcing move
            const board: Table<PlayerOrNone> = [
                [_, _, _, O, O, O, _],
                [O, X, X, X, X, X, _],
                [O, X, X, X, X, X, O],
                [_, O, O, O, _, _, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 40);
            const node: SixNode = new SixNode(state);

            // When listing the choices
            const choices: SixMove[] = minimax.getListMoves(node);

            // Then there should be only one starting piece
            const startingCoord: Coord = choices[0].start.get();
            expect(choices.every((move: SixMove) => move.start.equalsValue(startingCoord))).toBeTrue();
        });
        xit('should only propose move that cut legally');
        it('should do forced move', () => {
            // Given a node with a forced move
            // (1. creating its parent node)
            const board: Table<PlayerOrNone> = [
                [O, O, O, O, X, X, X, X, O],
                [O, O, O, O, X, X, X, X, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 42);
            const parentNode: SixNode = new SixNode(state);
            // (2. getting the child from it)
            const forcingMove: SixMove = SixMove.ofMovement(new Coord(8, 0), new Coord(-1, 0));
            const node: SixNode = rules.choose(parentNode, forcingMove).get();

            // When getting the list of move
            const listMove: SixMove[] = minimax.getListMoves(node);

            // Then it should have only one landing coord: the forced landing
            expect(listMove.every((move: SixMove) => move.landing.equals(new Coord(-2, 0)))).toBeTrue();
        });
        it('Score after 40th turn should be a substraction of the number of piece', () => {
            const state: SixState = SixState.fromRepresentation([
                [X, X, X, X, O, O, O, O, O],
                [X, X, X, X, O, O, O, O, O],
            ], 40);
            const move: SixMove = SixMove.ofDrop(new Coord(1, 1));
            const node: SixNode = new SixNode(state, MGPOptional.empty(), MGPOptional.of(move));
            expect(minimax.getBoardValue(node).value).toBe(2);
        });
    });
    describe('getListMove', () => {
        it('should pass possible drops when Phase 1', () => {
            // Given a game state in phase 1
            const state: SixState = SixState.fromRepresentation([
                [O],
            ], 1);
            const node: SixNode = new SixNode(state);

            // When calculating the list of moves
            const listMoves: SixMove[] = minimax.getListMoves(node);

            // Then the list should have all the possible drops and only them
            expect(listMoves.every((move: SixMove) => move.isDrop())).toBeTrue();
            expect(listMoves.length).toBe(6); // One for each neighbors
        });
        it('should pass possible movement when Phase 2', () => {
            // Given a game state in phase 2
            const state: SixState = SixState.fromRepresentation([
                [O, O, O, X, X, X],
                [O, O, O, X, X, X],
            ], 42);
            const node: SixNode = new SixNode(state);

            // When calculating the list of moves
            const listMoves: SixMove[] = minimax.getListMoves(node);

            // Then the list should have all the possible deplacements and only them
            expect(listMoves.every((move: SixMove) => move.isDrop())).toBeFalse();
        });
        it('should include cutting move as well', () => {
            // Given a game state in phase 2
            const state: SixState = SixState.fromRepresentation([
                [O, O, X, O, X, X, O, X, _],
                [X, X, O, X, _, O, X, O, O],
            ], 43);
            const node: SixNode = new SixNode(state);

            // When calculating the list of moves
            const listMoves: SixMove[] = minimax.getListMoves(node);

            // Then the list should have all the possible deplacements and only them
            const cuttingMove: SixMove = SixMove.ofCut(new Coord(4, 0), new Coord(8, 0), new Coord(0, 0));
            expect(listMoves.some((move: SixMove) => move.equals(cuttingMove))).toBeTrue();
        });
    });
    it('should assign a value of 0 in case of draw', () => {
        // Given a state in a draw in phase 2
        const state: SixState = SixState.fromRepresentation([
            [O, O, X, X],
            [O, O, X, X],
        ], 42);
        const node: SixNode = new SixNode(state);

        // When calculating the board value
        const boardValue: SixBoardValue = minimax.getBoardValue(node);

        // Then it should be 0
        expect(boardValue.value).toBe(0);
    });
});
