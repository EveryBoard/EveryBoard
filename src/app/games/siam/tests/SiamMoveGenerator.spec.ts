/* eslint-disable max-lines-per-function */
import { SiamConfig, SiamNode, SiamRules } from '../SiamRules';
import { SiamPiece } from '../SiamPiece';
import { SiamState } from '../SiamState';
import { SiamMove } from '../SiamMove';
import { Table } from 'src/app/jscaip/TableUtils';
import { SiamMoveGenerator } from '../SiamMoveGenerator';
import { MGPOptional } from '@everyboard/lib';

const _: SiamPiece = SiamPiece.EMPTY;
const M: SiamPiece = SiamPiece.MOUNTAIN;

const U: SiamPiece = SiamPiece.LIGHT_UP;
const L: SiamPiece = SiamPiece.LIGHT_LEFT;
const R: SiamPiece = SiamPiece.LIGHT_RIGHT;

const d: SiamPiece = SiamPiece.DARK_DOWN;

describe('SiamMoveGenerator', () => {

    let moveGenerator: SiamMoveGenerator;
    const rules: SiamRules = SiamRules.get();
    const defaultConfig: MGPOptional<SiamConfig> = SiamRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new SiamMoveGenerator();
    });

    it('should provide 44 possible moves on initial board', () => {
        // Given the initial board
        const node: SiamNode = new SiamNode(rules.getInitialState(defaultConfig));

        // When listing the moves
        const firstTurnMoves: SiamMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then there should be exactly 44 moves
        expect(firstTurnMoves.length).toEqual(44);
    });

    it('should compute all expected moves', () => {
        // Given a specific board
        const board: Table<SiamPiece> = [
            [_, _, _, d, _],
            [_, _, _, d, _],
            [L, M, M, M, R],
            [_, _, _, U, _],
            [_, _, _, U, _],
        ];
        const state: SiamState = new SiamState(board, 1);
        const node: SiamNode = new SiamNode(state);

        // When listing the moves
        const moves: SiamMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then all expected moves are returned
        const moveType: { [moveTYpe: string]: number} = {
            moving: 0,
            rotation: 0,
            pushingInsertion: 0,
            slidingInsertion: 0,
        };
        for (const move of moves) {
            if (rules.isInsertion(move, state)) {
                if (move.landingOrientation === move.direction.get()) {
                    moveType.pushingInsertion = moveType.pushingInsertion + 1;
                } else {
                    moveType.slidingInsertion = moveType.slidingInsertion + 1;
                }
            } else if (move.isRotation()) {
                moveType.rotation = moveType.rotation + 1;
            } else {
                moveType.moving = moveType.moving + 1;
            }
        }
        expect(moveType).toEqual({ moving: 35, rotation: 12, pushingInsertion: 18, slidingInsertion: 16 });
    });

    it('should not propose inserting a piece when 5 pieces of the player are already on the board', () => {
        // Given a board with 5 pieces of the player
        const board: Table<SiamPiece> = [
            [d, _, _, d, _],
            [d, _, _, d, _],
            [_, M, M, U, _],
            [d, _, _, U, _],
            [_, _, _, M, _],
        ];
        const state: SiamState = new SiamState(board, 2);
        const node: SiamNode = new SiamNode(state);

        // When listing the moves
        const moves: SiamMove[] = moveGenerator.getListMoves(node, defaultConfig);
        for (const move of moves) {

            // Then no move should insert a new piece
            expect(rules.isInsertion(move, state)).toBeFalse();
        }
    });

});
