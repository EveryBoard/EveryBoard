import { MGPMap, MGPOptional } from '@everyboard/lib';
import { EncapsuleConfig, EncapsuleNode, EncapsuleRules } from '../EncapsuleRules';
import { EncapsuleRemainingPieces, EncapsuleSpace, EncapsuleState } from '../EncapsuleState';
import { Player } from 'src/app/jscaip/Player';
import { EncapsuleMoveGenerator } from '../EncapsuleMoveGenerator';
import { EncapsuleMove } from '../EncapsuleMove';
import { EncapsulePiece, Size } from '../EncapsulePiece';

const smallDark: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.SMALL, Player.ZERO);
const smallLight: EncapsulePiece = EncapsulePiece.ofSizeAndPlayer(Size.SMALL, Player.ONE);
const ___: EncapsuleSpace = new EncapsuleSpace(new MGPMap());
const X__: EncapsuleSpace = ___.put(smallLight);
const O__: EncapsuleSpace = ___.put(smallDark);

fdescribe('EncapsuleMoveGenerator', () => {

    let moveGenerator: EncapsuleMoveGenerator;
    const defaultConfig: MGPOptional<EncapsuleConfig> = EncapsuleRules.get().getDefaultRulesConfig();

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
            const remainingPieces: EncapsuleRemainingPieces =
                EncapsuleRules.get().getEncapsulePieceMapFrom([1, 2, 2], [2, 2]);
            const state: EncapsuleState = new EncapsuleState(board, 2, remainingPieces);
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
