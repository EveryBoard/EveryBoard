/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { LodestoneMoveGenerator } from '../LodestoneMoveGenerator';
import { LodestonePiece, LodestonePieceLodestone, LodestonePieceNone, LodestonePiecePlayer } from '../LodestonePiece';
import { LodestoneNode, LodestoneRules } from '../LodestoneRules';
import { LodestonePositions, LodestonePressurePlateGroup, LodestonePressurePlates, LodestoneState } from '../LodestoneState';

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
        const node: LodestoneNode = new LodestoneNode(LodestoneRules.get().getInitialState());

        // When computing all possible moves
        // Then there should be 618 possible moves
        // For each empty coord, each lodestone can be placed in 4 different position
        // For each position, we have to count the possible captures and how they can be placed
        // The total amounts to 618
        expect(moveGenerator.getListMoves(node).length).toBeGreaterThanOrEqual(618);
    });

    it('should propose 8 moves on a specific minimal board', () => {
        // Given a state with 4 empty spaces and no remaining pressure plate
        const O: LodestonePiece = LodestonePieceLodestone.ZERO_PULL_DIAGONAL;
        const X: LodestonePiece = LodestonePieceLodestone.ONE_PUSH_DIAGONAL;
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
            top: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 8),
            bottom: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 8),
            left: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 8),
            right: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 8),
        };
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, pressurePlates);

        const node: LodestoneNode = new LodestoneNode(state);
        // When computing all possible moves
        // Then there should be 4*2 possible moves
        expect(moveGenerator.getListMoves(node).length).toBe(8);
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
            top: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 7),
            bottom: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 7),
            left: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 7),
            right: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 7),
        };
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, pressurePlates);

        const node: LodestoneNode = new LodestoneNode(state);
        // When computing all possible moves
        for (const move of moveGenerator.getListMoves(node)) {
            // Then all moves should be legal
            expect(LodestoneRules.get().isLegal(move, state).isSuccess()).toBeTrue();
        }

    });

});
