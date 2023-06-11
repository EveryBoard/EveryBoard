import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { LodestoneCaptures, LodestoneMove } from './LodestoneMove';
import { LodestoneOrientation, LodestonePiece } from './LodestonePiece';
import { LodestoneInfos, LodestoneNode, LodestoneRules } from './LodestoneRules';
import { LodestoneState } from './LodestoneState';

export class LodestoneDummyMinimax extends Minimax<LodestoneMove, LodestoneState, LodestoneInfos> {
    public getListMoves(node: LodestoneNode): LodestoneMove[] {
        const state: LodestoneState = node.gameState;
        return this.flatMapEmptyCoords(state, (coord: Coord): LodestoneMove[] => {
            const moves: LodestoneMove[] = [];
            for (const isPush of this.nextDirection(state)) {
                const orientations: LodestoneOrientation[] = ['diagonal', 'orthogonal'];
                for (const orientation of orientations) {
                    const infos: LodestoneInfos =
                        LodestoneRules.get().applyMoveWithoutPlacingCaptures(state, coord, { isPush, orientation });
                    const captures: Coord[] = infos.captures;
                    const numberOfCaptures: number = captures.length;
                    for (const captures of this.captureCombinations(state, numberOfCaptures)) {
                        moves.push(new LodestoneMove(coord, isPush, orientation, captures));
                    }
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
            const available: LodestoneCaptures = state.remainingSpacesDetails();
            const subCombinations: MGPSet<LodestoneCaptures> = this.captureCombinations(state, numberOfCaptures-1);
            for (const subCombination of subCombinations) {
                if (subCombination.top + 1 <= available.top) {
                    combinations.add({ ...subCombination, top: subCombination.top + 1 });
                }
                if (subCombination.bottom + 1 <= available.bottom) {
                    combinations.add({ ...subCombination, bottom: subCombination.bottom + 1 });
                }
                if (subCombination.left + 1 <= available.left) {
                    combinations.add({ ...subCombination, left: subCombination.left + 1 });
                }
                if (subCombination.right + 1 <= available.right) {
                    combinations.add({ ...subCombination, right: subCombination.right + 1 });
                }
            }
            if (combinations.size() === 0) {
                // It was not possible to place all captures, so we keep the sub combinations
                return subCombinations;
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
                } else if (piece.isLodestone() && piece.owner === state.getCurrentPlayer()) {
                    // A player can also put a lodestone on its previous location
                    moves = moves.concat(f(coord));
                }
            }
        }
        return moves;
    }
    private nextDirection(state: LodestoneState): boolean[] {
        const nextDirection: MGPOptional<boolean> = state.nextLodestoneDirection();
        if (nextDirection.isPresent()) {
            return [nextDirection.get()];
        } else {
            return [true, false];
        }
    }
    public getBoardValue(node: LodestoneNode): BoardValue {
        const scores: [number, number] = node.gameState.getScores();
        let score: number;
        if (scores[0] === 24 && scores[1] !== 24) {
            score = Player.ZERO.getVictoryValue();
        } else if (scores[0] !== 24 && scores[1] === 24) {
            score = Player.ONE.getVictoryValue();
        } else {
            score = BoardValue.of(scores[0], scores[1]).value;
        }
        return new BoardValue(score);
    }
}
