/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { SixState } from '../SixState';
import { SixMove } from '../SixMove';
import { SixNode, SixRules } from '../SixRules';
import { SixMinimax, SixNodeUnheritance } from '../SixMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('SixMinimax', () => {

    let rules: SixRules;
    let minimax: SixMinimax;

    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;
    const _: number = Player.NONE.value;

    beforeEach(() => {
        rules = new SixRules(SixState);
        minimax = new SixMinimax(rules, 'SixMinimax');
    });
    describe('chooseMove', () => {
        it('should have boardInfo after first move', () => {
            let moveSuccess: boolean = rules.choose(SixMove.fromDrop(new Coord(-1, 0)));
            expect(moveSuccess).toBeTrue();
            let unheritance: SixNodeUnheritance = rules.node.getOwnValue(minimax);
            expect(unheritance.preVictory.isAbsent()).toBeTrue();

            moveSuccess = rules.choose(SixMove.fromDrop(new Coord(-1, 0)));
            expect(moveSuccess).toBeTrue();
            unheritance = rules.node.getOwnValue(minimax);
            expect(unheritance.preVictory.isAbsent()).toBeTrue();
        });
    });
    describe('pre-victories', () => {
        it('Should pass forcing move to children node to minimise calculations', () => {
            const board: number[][] = [
                [X, _, _, _, _, _, X],
                [O, _, _, _, _, O, _],
                [O, _, _, _, O, _, _],
                [O, _, _, O, X, _, _],
                [O, _, O, X, _, _, _],
                [_, O, X, X, _, _, _],
                [_, X, _, _, _, _, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 10);
            const move: SixMove = SixMove.fromDrop(new Coord(0, 5));
            rules.node = new SixNode(state);
            expect(rules.choose(move)).toBeTrue();
            const chosenMove: SixMove = rules.node.findBestMove(1, minimax);
            expect(chosenMove).toEqual(SixMove.fromDrop(new Coord(0, 6)));
            expect(rules.node.countDescendants()).toBe(1);
        });
        it('should know that 5 pieces aligned with two empty extension mean PRE_VICTORY', () => {
            const state: SixState = SixState.fromRepresentation([
                [X, X, X, X, X],
            ], 2);
            const previousMove: SixMove = SixMove.fromDrop(new Coord(0, 0));
            RulesUtils.expectStateToBePreVictory(state, previousMove, Player.ONE, [minimax]);
        });
        it('should know that full-bowtie aligned with two empty extension mean PRE_VICTORY', () => {
            const state: SixState = SixState.fromRepresentation([
                [_, O, O, O],
                [O, O, O, X],
                [O, X, X, X],
                [O, X, X, _],

            ], 2);
            const previousMove: SixMove = SixMove.fromDrop(new Coord(2, 2));
            RulesUtils.expectStateToBePreVictory(state, previousMove, Player.ONE, [minimax]);
        });
        it('should only count one preVictory when one coord is a forcing move for two lines', () => {
            const board: number[][] = [
                [_, _, X, _, _, X],
                [_, _, O, _, O, _],
                [_, _, O, O, _, _],
                [_, _, _, _, _, O],
                [_, O, O, _, O, X],
                [O, _, O, O, X, X],
            ];
            const state: SixState = SixState.fromRepresentation(board, 9);
            const move: SixMove = SixMove.fromDrop(new Coord(2, 3));
            rules.node = new SixNode(state);
            const node: SixNode = new SixNode(state, MGPOptional.empty(), MGPOptional.of(move));
            const boardValue: SixNodeUnheritance = minimax.getBoardValue(node);
            expect(boardValue.preVictory.isAbsent()).toBeTrue();
            expect(boardValue.value).toBe(Player.ZERO.getPreVictory());
        });
        it('should point the right preVictory coord with circle', () => {
            const board: number[][] = [
                [_, O, _, X],
                [O, _, O, _],
                [O, O, _, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 9);
            const move: SixMove = SixMove.fromDrop(new Coord(1, 0));
            const node: SixNode = new SixNode(state, MGPOptional.empty(), MGPOptional.of(move));
            const boardValue: SixNodeUnheritance = minimax.getBoardValue(node);
            expect(boardValue.preVictory.equalsValue(new Coord(2, 0))).toBeTrue();
        });
    });
    describe('4 pieces aligned is better than 3 pieces aligned', () => {
        it('should be true with lines', () => {
            const move: SixMove = SixMove.fromDrop(new Coord(1, 1));
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
            const move: SixMove = SixMove.fromDrop(new Coord(1, 3));
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
            const move: SixMove = SixMove.fromDrop(new Coord(2, 1));
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
            const move: SixMove = SixMove.fromDrop(new Coord(1, 1));
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
        it('Should not consider moving piece that are blocking an opponent victory', () => {
            const board: number[][] = [
                [O, O, _, _, _, _, O],
                [X, _, _, _, _, X, _],
                [X, _, _, O, X, X, _],
                [X, X, O, X, X, O, _],
                [X, _, X, X, O, _, _],
                [_, X, _, _, _, _, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 39);
            const move: SixMove = SixMove.fromDrop(new Coord(0, 5));
            rules.node = new SixNode(state);
            expect(rules.choose(move)).toBeTrue();
            const bestMove: SixMove = rules.node.findBestMove(1, minimax);
            const expectedMove: SixMove = SixMove.fromMovement(new Coord(1, 0), new Coord(0, 6));
            expect(bestMove).toEqual(expectedMove);
            expect(rules.node.countDescendants()).toBe(1);
        });
        it(`Should propose only one starting piece when all piece are blocking an opponent's victory`, () => {
            // Given an initial board with all piece are blocked
            const board: number[][] = [
                [O, _, _, _, _, _, O],
                [X, _, _, _, _, X, _],
                [X, _, _, O, X, X, _],
                [X, X, O, X, X, O, _],
                [X, _, X, X, O, _, _],
                [_, X, _, _, _, _, _],
            ];
            const state: SixState = SixState.fromRepresentation(board, 39);
            rules.node = new SixNode(state);
            const move: SixMove = SixMove.fromDrop(new Coord(0, 5));
            expect(rules.choose(move)).toBeTrue();

            expect(rules.getGameStatus(rules.node).isEndGame).toBeFalse();
            const bestMove: SixMove = rules.node.findBestMove(1, minimax);
            expect(bestMove).toEqual(SixMove.fromMovement(new Coord(0, 0), new Coord(0, 6)));
            expect(rules.node.countDescendants()).toBe(1);

            expect(rules.choose(bestMove)).toBeTrue();
            expect(rules.getGameStatus(rules.node).isEndGame).toBeFalse();
        });
        // TODO: comparing what's best between that calculation and Phase 1 one
        it('Score after 40th turn should be a substraction of the number of piece', () => {
            const state: SixState = SixState.fromRepresentation([
                [X, X, X, X, O, O, O, O, O],
                [X, X, X, X, O, O, O, O, O],
            ], 40);
            const move: SixMove = SixMove.fromDrop(new Coord(1, 1));
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
        it('should pass cutting move as well', () => {
            // Given a game state in phase 2
            const state: SixState = SixState.fromRepresentation([
                [O, O, O, O, X, X, X, X, _],
                [X, X, X, X, _, O, O, O, O],
            ], 43);
            const node: SixNode = new SixNode(state);

            // When calculating the list of moves
            const listMoves: SixMove[] = minimax.getListMoves(node);

            // Then the list should have all the possible deplacements and only them
            expect(listMoves.some((move: SixMove) => move.isCut())).toBeTrue();
        });
    });
});
