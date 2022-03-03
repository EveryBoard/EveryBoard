/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { MartianChessMove } from '../MartianChessMove';
import { MartianChessRules } from '../MartianChessRules';
import { MartianChessPiece, MartianChessState } from '../MartianChessState';

describe('MartianChessRules', () => {

    const _: MartianChessPiece = MartianChessPiece.EMPTY;
    const A: MartianChessPiece = MartianChessPiece.PAWN;
    const B: MartianChessPiece = MartianChessPiece.DRONE;
    const C: MartianChessPiece = MartianChessPiece.QUEEN;

    let rules: MartianChessRules;

    let minimaxes: Minimax<MartianChessMove, MartianChessState>[];

    beforeEach(() => {
        rules = new MartianChessRules(MartianChessState);
        minimaxes = [
        ];
    });
    it('Should be illegal to choose a piece in the opponent territory', () => {
        // Given any board
        const board: Table<MartianChessPiece> = [
            [_, A, B, C],
            [_, A, B, C],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, A, B, C],
        ];
        const state: MartianChessState = new MartianChessState(board, 0);

        // When moving a piece on another one
        const move: MartianChessMove = MartianChessMove.from(new Coord(1, 1), new Coord(2, 2));

        // Then the move should be illegal
        const reason: string = MartianChessRulesFailure.MUST_CHOOSE_PIECE_FROM_YOUR_TERRITORY();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('should be illegal to choose an empty square');
    it('should be illegal to move a piece non linearly');
    it('should be illegal to move a piece on another piece on your territory');
    it('should be illegal to move a piece out of the board');
    it('should be illegal to move a pawn not on one of the 4 diagonal neighboor');
    it('should be illegal to land a drone on it starting coord');
    it('should be illegal to land a drone more than two orthogonal step');
    it('should be illegal to jump over another piece with a drone or queen');
    it('should be illegal to undo the opponent last move');
    it('should be legal to move a pawn on one of the 4 diagonal neighboor');
    it('should be legal to move a drone of two steps');
    it('should be legal to move a queen as far as you want linarly');
    describe('field promotion', () => {
        it('should be illegal to merge two pawn in drone when no drone or queen present but no drone available');
        it('should be legal to merge one pawn and one drone in one queen when no queen present but no queen available');
        it('should be legal to merge two pawn in drone when no drone or queen present');
        it('should be legal to merge one pawn and one drone in one queen when no queen present');
    });
    describe('end game', () => {
        it('should end the game when one player put its last piece in the opponent territory');
        it('should be legal to "call the clock" during your turn');
        it('should reset clock countdown when a capture occurs');
        it('should end the game when 7 moves passed since someone called the clock');
        it('should declare winner the player with the more points at the end');
        it('should declare last player winner when both have as much points');
    });
});
