/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LodestoneMoveGenerator } from '../LodestoneMoveGenerator';
import { LodestonePiece, LodestonePieceLodestone, LodestonePieceNone, LodestonePiecePlayer } from '../LodestonePiece';
import { LodestoneNode, LodestoneRules } from '../LodestoneRules';
import { LodestonePositions, LodestonePressurePlate, LodestonePressurePlates, LodestoneState } from '../LodestoneState';
import { LodestoneMove } from '../LodestoneMove';

describe('LodestoneMoveGenerator', () => {

    let moveGenerator: LodestoneMoveGenerator;

    const N: LodestonePiece = LodestonePieceNone.UNREACHABLE;
    const _: LodestonePiece = LodestonePieceNone.EMPTY;
    const A: LodestonePiece = LodestonePiecePlayer.ZERO;
    const B: LodestonePiece = LodestonePiecePlayer.ONE;

    beforeEach(() => {
        moveGenerator = new LodestoneMoveGenerator();
    });

    it('should propose at least 618 moves at first turn', () => {
        // Given the initial state
        const node: LodestoneNode = new LodestoneNode(LodestoneState.getInitialState());

        // When listing the moves
        const moves: LodestoneMove[] = moveGenerator.getListMoves(node);

        // Then there should be 618 possible moves
        // For each empty coord, each lodestone can be placed in 4 different position
        // For each position, we have to count the possible captures and how they can be placed
        // The total amounts to 618
        expect(moves.length).toBeGreaterThanOrEqual(618);
    });

    it('should propose 8 moves on a specific minimal board', () => {
        // Given a state with 4 empty spaces and no remaining pressure plate
        const O: LodestonePiece = LodestonePieceLodestone.of(Player.ZERO,
                                                             { direction: 'pull', orientation: 'diagonal' });
        const X: LodestonePiece = LodestonePieceLodestone.of(Player.ONE,
                                                             { direction: 'push', orientation: 'diagonal' });
        const board: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N],
            [N, N, B, A, X, _, N, N],
            [N, N, A, B, A, _, N, N],
            [N, N, B, B, A, O, N, N],
            [N, N, A, A, B, _, N, N],
            [N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N],
        ];
        const lodestones: LodestonePositions = new MGPMap([
            { key: Player.ZERO, value: new Coord(5, 4) },
            { key: Player.ONE, value: new Coord(4, 2) },
        ]);
        const pressurePlates: LodestonePressurePlates = {
            top: MGPOptional.empty(),
            bottom: MGPOptional.empty(),
            left: MGPOptional.empty(),
            right: MGPOptional.empty(),
        };
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, pressurePlates);
        const node: LodestoneNode = new LodestoneNode(state);

        // When listing the moves
        const moves: LodestoneMove[] = moveGenerator.getListMoves(node);

        // Then there should be 4*2 possible moves
        expect(moves.length).toBe(8);
    });

    it('should not propose illegal moves when there is only one spot left in pressure plates', () => {
        // Given a state with one remaining spot per pressure plate
        const board: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [N, _, _, A, _, _, _, N],
            [N, _, B, _, _, _, _, N],
            [N, _, A, _, _, _, _, N],
            [N, _, B, _, _, _, _, N],
            [N, _, A, _, _, _, _, N],
            [N, _, _, _, _, _, _, N],
            [N, N, N, N, N, N, N, N],
        ];
        const lodestones: LodestonePositions = new MGPMap();
        const pressurePlates: LodestonePressurePlates = {
            top: LodestonePressurePlate.EMPTY_3.addCaptured(Player.ZERO, 2),
            bottom: LodestonePressurePlate.EMPTY_3.addCaptured(Player.ZERO, 2),
            left: LodestonePressurePlate.EMPTY_3.addCaptured(Player.ZERO, 2),
            right: LodestonePressurePlate.EMPTY_3.addCaptured(Player.ZERO, 2),
        };
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, pressurePlates);

        const node: LodestoneNode = new LodestoneNode(state);

        // When listing the moves
        const moves: LodestoneMove[] = moveGenerator.getListMoves(node);
        for (const move of moves) {

            // Then all moves should be legal
            expect(LodestoneRules.get().isLegal(move, state).isSuccess()).toBeTrue();
        }
    });

});
