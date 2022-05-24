/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LodestoneDummyMinimax } from '../LodestoneDummyMinimax';
import { LodestonePiece, LodestonePieceLodestone, LodestonePieceNone, LodestonePiecePlayer } from '../LodestonePiece';
import { LodestoneNode, LodestoneRules } from '../LodestoneRules';
import { LodestoneLodestonesPositions, LodestonePressurePlate, LodestonePressurePlates, LodestoneState } from '../LodestoneState';

describe('LodestoneDummyMinimax', () => {
    let rules: LodestoneRules;
    let minimax: LodestoneDummyMinimax;

    const N: LodestonePiece = LodestonePieceNone.UNREACHABLE;
    const _: LodestonePiece = LodestonePieceNone.EMPTY;
    const A: LodestonePiece = LodestonePiecePlayer.ZERO;
    const B: LodestonePiece = LodestonePiecePlayer.ONE;

    beforeEach(() => {
        rules = LodestoneRules.get();
        minimax = new LodestoneDummyMinimax(rules, 'LodestoneDummyMinimax');
    });
    it('should propose 618 moves at first turn', () => {
        // Given the initial state
        const node: LodestoneNode = new LodestoneNode(LodestoneState.getInitialState());

        // When computing all possible moves
        // Then there should be 618 possible moves
        // For each empty coord, each lodestone can be placed in 4 different position
        // For each position, we have to count the possible captures and how they can be placed
        // The total amounts to 618
        expect(minimax.getListMoves(node).length).toBe(618);
    });
    it('should propose 8 moves on a specific minimal board', () => {
        // Given a state with 4 empty spaces and no remaining pressure plate
        const X: LodestonePiece = LodestonePieceLodestone.of(Player.ZERO, 'pull', 'diagonal');
        const Y: LodestonePiece = LodestonePieceLodestone.of(Player.ONE, 'push', 'diagonal');
        const board: Table<LodestonePiece> = [
            [N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N],
            [N, N, B, A, Y, _, N, N],
            [N, N, A, B, A, _, N, N],
            [N, N, B, B, A, X, N, N],
            [N, N, A, A, B, _, N, N],
            [N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N],
        ];
        const lodestones: LodestoneLodestonesPositions = new MGPMap([
            { key: Player.ZERO, value: MGPOptional.of(new Coord(5, 4)) },
            { key: Player.ONE, value: MGPOptional.of(new Coord(4, 2)) },
        ]);
        const pressurePlates: LodestonePressurePlates = {
            top: MGPOptional.empty(),
            bottom: MGPOptional.empty(),
            left: MGPOptional.empty(),
            right: MGPOptional.empty(),
        };
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, pressurePlates);

        const node: LodestoneNode = new LodestoneNode(state);
        // When computing all possible moves
        // Then there should be 4*2 possible moves
        expect(minimax.getListMoves(node).length).toBe(8);
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
        const lodestones: LodestoneLodestonesPositions = new MGPMap([
            { key: Player.ZERO, value: MGPOptional.empty() },
            { key: Player.ONE, value: MGPOptional.empty() },
        ]);
        const pressurePlates: LodestonePressurePlates = {
            top: LodestonePressurePlate.EMPTY_3.addCaptured(Player.ZERO, 2),
            bottom: LodestonePressurePlate.EMPTY_3.addCaptured(Player.ZERO, 2),
            left: LodestonePressurePlate.EMPTY_3.addCaptured(Player.ZERO, 2),
            right: LodestonePressurePlate.EMPTY_3.addCaptured(Player.ZERO, 2),
        };
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, pressurePlates);

        const node: LodestoneNode = new LodestoneNode(state);
        // When computing all possible moves
        for (const move of minimax.getListMoves(node)) {
            // Then all moves should be legal
            expect(LodestoneRules.get().isLegal(move, state).isSuccess()).toBeTrue();
        }

    });
});
