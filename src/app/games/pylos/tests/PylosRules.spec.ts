import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { PylosCoord } from '../PylosCoord';
import { PylosMove } from '../PylosMove';
import { PylosState } from '../PylosState';
import { PylosRules } from '../PylosRules';
import { PylosMinimax } from '../PylosMinimax';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { PylosFailure } from '../PylosFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('PylosRules:', () => {

    let rules: PylosRules;
    let minimax: PylosMinimax;

    const _: Player = Player.NONE;
    const O: Player = Player.ZERO;
    const X: Player = Player.ONE;

    beforeEach(() => {
        rules = new PylosRules(PylosState);
        minimax = new PylosMinimax(rules, 'PylosMinimax');
    });
    it(`should forbid move who'se landing coord is not empty`, () => {
        const board: Player[][][] = [
            [
                [O, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), []);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toEqual(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
    });
    it('should forbid move starting by an empty piece', () => {
        const board: Player[][][] = [
            [
                [_, _, _, _],
                [_, _, _, _],
                [_, _, O, X],
                [_, _, X, O],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);
        const move: PylosMove = PylosMove.fromClimb(new PylosCoord(0, 0, 0), new PylosCoord(2, 2, 1), []);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
    });
    it('should forbid move starting by an opponent piece', () => {
        const board: Player[][][] = [
            [
                [X, _, _, _],
                [_, _, _, _],
                [_, _, O, X],
                [_, _, X, O],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);
        const move: PylosMove = PylosMove.fromClimb(new PylosCoord(0, 0, 0), new PylosCoord(2, 2, 1), []);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    });
    it(`should forbid move who'se landing coord is not landable (not on the floor, not over 4 lower pieces)`, () => {
        const board: Player[][][] = [
            [
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 1), []);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(PylosFailure.CANNOT_LAND());
    });
    it('should forbid move who capture without having formed a squared', () => {
        const board: Player[][][] = [
            [
                [O, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, O],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);
        const move: PylosMove =
            PylosMove.fromDrop(new PylosCoord(0, 3, 0), [new PylosCoord(0, 0, 0), new PylosCoord(3, 3, 0)]);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(PylosFailure.CANNOT_CAPTURE());
    });
    it('should forbid move who capture non-player piece or supporting-piece', () => {
        const board: Player[][][] = [
            [
                [_, O, O, _],
                [O, O, X, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, O, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);

        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), [new PylosCoord(2, 2, 0)]);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(PylosFailure.INVALID_FIRST_CAPTURE());

        const otherMove: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0),
                                                        [new PylosCoord(0, 0, 0), new PylosCoord(1, 0, 0)]);
        const otherStatus: LegalityStatus = rules.isLegal(otherMove, state);
        expect(otherStatus.legal.reason).toBe(PylosFailure.INVALID_SECOND_CAPTURE());
    });
    it('should allow legal capture to include landing piece', () => {
        const board: Player[][][] = [
            [
                [_, O, _, _],
                [O, O, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), [new PylosCoord(0, 0, 0)]);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
    });
    it('should forbid piece to climb over itself', () => {
        const board: Player[][][] = [
            [
                [X, O, _, _],
                [O, O, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);
        const move: PylosMove = PylosMove.fromClimb(new PylosCoord(1, 1, 0), new PylosCoord(0, 0, 1), []);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(PylosFailure.SHOULD_HAVE_SUPPORTING_PIECES());
    });
    it('should forbid piece to climb when supporting', () => {
        const board: Player[][][] = [
            [
                [X, O, _, _],
                [O, O, _, _],
                [X, X, _, _],
                [_, _, _, _],
            ], [
                [O, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);
        const move: PylosMove = PylosMove.fromClimb(new PylosCoord(1, 0, 0), new PylosCoord(0, 1, 1), []);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.reason).toBe(PylosFailure.SHOULD_HAVE_SUPPORTING_PIECES());
    });
    it('should allow legal capture to include piece supporting previously captured stone', () => {
        const board: Player[][][] = [
            [
                [X, O, X, O],
                [O, X, O, X],
                [X, O, X, O],
                [O, _, _, _],
            ], [
                [_, O, X],
                [O, O, X],
                [_, _, _],
            ], [
                [_, O],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);
        const move: PylosMove = PylosMove.fromClimb(new PylosCoord(0, 3, 0),
                                                    new PylosCoord(0, 0, 1),
                                                    [new PylosCoord(1, 0, 2), new PylosCoord(1, 0, 1)]);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
    });
    it('should declare looser Player.ZERO when he put his 15th ball', () => {
        const board: Player[][][] = [
            [
                [X, O, X, O],
                [O, O, O, O],
                [X, O, X, O],
                [O, O, O, O],
            ], [
                [O, _, _],
                [_, O, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(2, 2, 1), []);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: PylosState = rules.applyLegalMove(move, state, status);
        expect(minimax.getBoardValue(new MGPNode(resultingState, MGPOptional.empty(), MGPOptional.of(move))).value)
            .toBe(Number.MAX_SAFE_INTEGER);
    });
    it('should declare looser Player.ONE when he put his 15th ball', () => {
        const board: Player[][][] = [
            [
                [O, X, O, X],
                [X, X, X, X],
                [O, X, O, X],
                [X, X, X, X],
            ], [
                [X, _, _],
                [_, X, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 1);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(2, 2, 1), []);
        const status: LegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: PylosState = rules.applyLegalMove(move, state, status);
        expect(minimax.getBoardValue(new MGPNode(resultingState, MGPOptional.empty(), MGPOptional.of(move))).value)
            .toBe(Number.MIN_SAFE_INTEGER);
    });
});
