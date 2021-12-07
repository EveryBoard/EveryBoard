import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflConfig } from '../TaflConfig';
import { TaflFailure } from '../TaflFailure';
import { TaflLegalityStatus } from '../TaflLegalityStatus';
import { TaflMove } from '../TaflMove';
import { TaflPawn } from '../TaflPawn';
import { TaflRules, TaflState } from '../TaflRules';
import { MyTaflMove } from './MyTaflMove.spec';
import { MyTaflState } from './MyTaflState.spec';

const myTaflConfig: TaflConfig = {

    CASTLE_IS_LEFT_FOR_GOOD: true,

    INVADER: Player.ZERO,

    KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_SANDWICHED: true,

    CENTRAL_THRONE_CAN_SURROUND_KING: true,

    BORDER_CAN_SURROUND_KING: true,

    WIDTH: 7,
};

class MyTaflRules extends TaflRules<MyTaflMove, MyTaflState> {

    private static singleton: MyTaflRules;

    public static get(): MyTaflRules {
        if (MyTaflRules.singleton == null) {
            MyTaflRules.singleton = new MyTaflRules();
        }
        return MyTaflRules.singleton;
    }
    private constructor() {
        super(MyTaflState, myTaflConfig, MyTaflMove.from);
    }
}

class MyTaflNode extends MGPNode<MyTaflRules, MyTaflMove, MyTaflState> {}

describe('TaflRules', () => {

    let rules: MyTaflRules;
    let minimaxes: Minimax<TaflMove, TaflState, TaflLegalityStatus>[];

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.INVADERS;
    const X: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = MyTaflRules.get();
        minimaxes = [
        ];
    });
    describe('getSurroundings', () => {
        it('Should return neighboorings cases', () => {
            const startingBoard: Table<TaflPawn> = rules.node.gameState.getCopiedBoard();
            const { backCoord } =
                rules.getSurroundings(new Coord(3, 1), Orthogonal.RIGHT, Player.ZERO, startingBoard);
            expect(backCoord).toEqual(new Coord(4, 1));
        });
    });
    it('Moving emptyness should be illegal', () => {
        // Given initial board
        const state: MyTaflState = MyTaflState.getInitialState();

        // When trying to move an empty piece
        const move: MyTaflMove = new MyTaflMove(new Coord(0, 1), new Coord(1, 1));

        // Then the move should be illegal
        const reason: string = RulesFailure.MUST_CHOOSE_PLAYER_PIECE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('Moving opponent pawn should be illegal', () => {
        expect(rules.choose(new MyTaflMove(new Coord(4, 2), new Coord(4, 3)))).toBeFalse();
    });
    it('Landing on pawn should be illegal', () => {
        // Given initial board
        const state: MyTaflState = MyTaflState.getInitialState();

        // When doing a move landing on the ennemy
        const move: MyTaflMove = new MyTaflMove(new Coord(1, 0), new Coord(1, 3));

        // Then the move should be juged illegal
        const reason: string = TaflFailure.LANDING_ON_OCCUPIED_CASE();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('Passing through pawn should be illegal', () => {
        // Given initial board
        const state: MyTaflState = MyTaflState.getInitialState();

        // When doing a move passing through a piece
        const move: MyTaflMove = new MyTaflMove(new Coord(1, 0), new Coord(1, 4));

        // Then the move should be juged illegal
        const reason: string = TaflFailure.SOMETHING_IN_THE_WAY();
        RulesUtils.expectMoveFailure(rules, state, move, reason);
    });
    it('Should consider defender winner when all invaders are dead', () => {
        const board: Table<TaflPawn> = [
            [_, O, _, A, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, _, A, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, X, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: MyTaflState = new MyTaflState(board, 23);
        const move: MyTaflMove = new MyTaflMove(new Coord(3, 0), new Coord(2, 0));
        const status: TaflLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: MyTaflState = rules.applyLegalMove(move, state, status);
        const expectedState: MyTaflState = new MyTaflState(expectedBoard, 24);
        expect(resultingState).toEqual(expectedState);
        const node: MyTaflNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
    });
    it('Should consider invader winner when all defender are immobilized', () => {
        const board: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _],
            [X, O, _, _, _, _, _, _, _],
            [A, _, _, _, _, _, _, _, O],
            [X, O, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: Table<TaflPawn> = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _],
            [X, O, _, _, _, _, _, _, _],
            [A, O, _, _, _, _, _, _, _],
            [X, O, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: MyTaflState = new MyTaflState(board, 24);
        const move: MyTaflMove = new MyTaflMove(new Coord(8, 4), new Coord(1, 4));
        const status: TaflLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: MyTaflState = rules.applyLegalMove(move, state, status);
        const expectedState: MyTaflState = new MyTaflState(expectedBoard, 25);
        expect(resultingState).toEqual(expectedState);
        const node: MyTaflNode = new MGPNode(null, move, expectedState);
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
});
