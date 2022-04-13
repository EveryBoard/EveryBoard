import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { LodestoneCaptures, LodestoneMove } from './LodestoneMove';
import { LodestoneDirection, LodestonePiece } from './LodestonePiece';
import { LodestoneInfos, LodestoneNode, LodestoneRules } from './LodestoneRules';
import { LodestoneState } from './LodestoneState';

export class LodestoneDummyMinimax extends Minimax<LodestoneMove, LodestoneState, LodestoneInfos> {
    public getListMoves(node: LodestoneNode): LodestoneMove[] {
        const state: LodestoneState = node.gameState;
        return this.flatMapEmptyCoords(state, (coord: Coord): LodestoneMove[] => {
            const moves: LodestoneMove[] = [];
            for (const [direction, diagonal] of this.nextDirectionAndDiagonal(state)) {
                const captures: Coord[] =
                    LodestoneRules.get().applyMoveWithoutPlacingCaptures(state, coord, direction, diagonal)[1];
                const numberOfCaptures: number = captures.length;
                for (const captures of this.captureCombinations(state, numberOfCaptures)) {
                    moves.push(new LodestoneMove(coord, direction, diagonal, captures));
                }
            }
            return moves;
        });
    }
    private captureCombinations(state: LodestoneState, numberOfCaptures: number): MGPSet<LodestoneCaptures> {
        if (numberOfCaptures === 0) {
            return new MGPSet([{ top: 0, bottom: 0, left: 0, right: 0 }]);
        } else {
            const combinations: MGPSet<LodestoneCaptures> = new MGPSet();
            const available: LodestoneCaptures = state.remainingSpacesDetailed();
            for (const subCombination of this.captureCombinations(state, numberOfCaptures-1)) {
                if (subCombination.top + 1 <= available.top) {
                    combinations.add({ ...subCombination, top: subCombination.top + 1 });
                }
                if (subCombination.bottom + 1 < available.bottom) {
                    combinations.add({ ...subCombination, bottom: subCombination.bottom + 1 });
                }
                if (subCombination.left + 1 < available.left) {
                    combinations.add({ ...subCombination, left: subCombination.left + 1 });
                }
                if (subCombination.right + 1 < available.right) {
                    combinations.add({ ...subCombination, right: subCombination.right + 1 });
                }
            }
            return combinations;
        }
    }
    private flatMapEmptyCoords(state: LodestoneState, f: (coord: Coord) => LodestoneMove[]): LodestoneMove[] {
        let moves: LodestoneMove[] = [];
        for (let y: number = 0; y < LodestoneState.SIZE; y++) {
            for (let x: number = 0; x < LodestoneState.SIZE; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: LodestonePiece = state.getPieceAt(coord);
                if (piece.isEmpty() && piece.isUnreachable() === false) {
                    moves = moves.concat(f(coord));
                }
            }
        }
        return moves;
    }
    private nextDirectionAndDiagonal(state: LodestoneState): [LodestoneDirection, boolean][] {
        const nextDirection: MGPOptional<LodestoneDirection> = state.nextLodestoneDirection();
        const nextDirectionAndDiagonal: [LodestoneDirection, boolean][] = [];
        if (nextDirection.isPresent()) {
            nextDirectionAndDiagonal.push([nextDirection.get(), true]);
            nextDirectionAndDiagonal.push([nextDirection.get(), false]);
        } else {
            nextDirectionAndDiagonal.push(['push', true]);
            nextDirectionAndDiagonal.push(['push', false]);
            nextDirectionAndDiagonal.push(['pull', true]);
            nextDirectionAndDiagonal.push(['pull', false]);
        }
        return nextDirectionAndDiagonal;
    }
    public getBoardValue(node: LodestoneNode): NodeUnheritance {
        const scores: [number, number] = node.gameState.getScores();
        return new NodeUnheritance(scores[0] * Player.ZERO.getScoreModifier() +
            scores[1] * Player.ONE.getScoreModifier());
    }
}
