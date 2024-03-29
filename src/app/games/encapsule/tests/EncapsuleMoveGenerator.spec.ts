import { EncapsulePiece } from '../EncapsulePiece';
import { EncapsuleNode, EncapsuleRules } from '../EncapsuleRules';
import { EncapsuleSpace, EncapsuleState } from '../EncapsuleState';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { EncapsuleMoveGenerator } from '../EncapsuleMoveGenerator';
import { EncapsuleMove } from '../EncapsuleMove';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

const ___: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
const X__: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.ONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
const O__: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.ZERO, PlayerOrNone.NONE, PlayerOrNone.NONE);
const O0: EncapsulePiece = EncapsulePiece.SMALL_DARK;
const O1: EncapsulePiece = EncapsulePiece.MEDIUM_DARK;
const O2: EncapsulePiece = EncapsulePiece.BIG_DARK;
const X0: EncapsulePiece = EncapsulePiece.SMALL_LIGHT;
const X1: EncapsulePiece = EncapsulePiece.MEDIUM_LIGHT;
const X2: EncapsulePiece = EncapsulePiece.BIG_LIGHT;

describe('EncapsuleMoveGenerator', () => {

    let moveGenerator: EncapsuleMoveGenerator;
    const defaultConfig: NoConfig = EncapsuleRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new EncapsuleMoveGenerator();
    });

    describe('getListMoves', () => {

        it('should have 27 moves on first turn', () => {
            // Given an initial node
            const node: EncapsuleNode = EncapsuleRules.get().getInitialNode(defaultConfig);

            // When listing the moves
            const moves: EncapsuleMove[] = moveGenerator.getListMoves(node, defaultConfig);

            // Then the should be 3 pieces x 9 coords = 27 moves
            expect(moves.length).toBe(27);
        });

        it('should have XX moves on a specific third turn', () => {
            // Given a board like this
            const board: EncapsuleSpace[][] = [
                [O__, ___, ___],
                [___, X__, ___],
                [___, ___, ___],
            ];
            const state: EncapsuleState = new EncapsuleState(board, 2, [
                O0, O1, O1, O2, O2,
                X0, X0, X1, X2,
            ]);
            const node: EncapsuleNode = new EncapsuleNode(state);

            // When listing the moves
            const moves: EncapsuleMove[] = moveGenerator.getListMoves(node, defaultConfig);

            // Then there should be:
            // Drops medium = 9, drops big = 9, drops small = 7
            // Moving the piece on board = 7 possible landing space
            // Total: 32
            expect(moves.length).toBe(32);
        });

    });

});
