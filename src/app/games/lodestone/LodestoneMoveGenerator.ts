import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional, Set } from '@everyboard/lib';
import { LodestoneCaptures, LodestoneMove } from './LodestoneMove';
import { LodestoneDirection, LodestoneOrientation, LodestonePiece } from './LodestonePiece';
import { LodestoneInfos, LodestoneNode, LodestoneRules } from './LodestoneRules';
import { LodestoneState } from './LodestoneState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class LodestoneMoveGenerator extends MoveGenerator<LodestoneMove, LodestoneState> {

    public override getListMoves(node: LodestoneNode, _config: NoConfig): LodestoneMove[] {
        const state: LodestoneState = node.gameState;
        return this.flatMapEmptyCoords(state, (coord: Coord): LodestoneMove[] => {
            const moves: LodestoneMove[] = [];
            for (const direction of this.nextDirection(state)) {
                const orientations: LodestoneOrientation[] = ['diagonal', 'orthogonal'];
                for (const orientation of orientations) {
                    const infos: LodestoneInfos =
                        LodestoneRules.get().applyMoveWithoutPlacingCaptures(state, coord, { direction, orientation });
                    const captures: Coord[] = infos.captures;
                    const numberOfCaptures: number = captures.length;
                    for (const captureCombination of this.captureCombinations(state, numberOfCaptures)) {
                        moves.push(new LodestoneMove(coord, direction, orientation, captureCombination));
                    }
                }
            }
            return moves;
        });
    }
    private captureCombinations(state: LodestoneState, numberOfCaptures: number): Set<LodestoneCaptures> {
        if (numberOfCaptures === 0) {
            return new Set([{ top: 0, bottom: 0, left: 0, right: 0 }]);
        } else {
            let combinations: Set<LodestoneCaptures> = new Set();
            const available: LodestoneCaptures = state.remainingSpacesDetails();
            const subCombinations: Set<LodestoneCaptures> =
                this.captureCombinations(state, numberOfCaptures - 1);
            for (const subCombination of subCombinations) {
                if (subCombination.top + 1 <= available.top) {
                    combinations = combinations.addElement({ ...subCombination, top: subCombination.top + 1 });
                }
                if (subCombination.bottom + 1 <= available.bottom) {
                    combinations = combinations.addElement({ ...subCombination, bottom: subCombination.bottom + 1 });
                }
                if (subCombination.left + 1 <= available.left) {
                    combinations = combinations.addElement({ ...subCombination, left: subCombination.left + 1 });
                }
                if (subCombination.right + 1 <= available.right) {
                    combinations = combinations.addElement({ ...subCombination, right: subCombination.right + 1 });
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
    private nextDirection(state: LodestoneState): LodestoneDirection[] {
        const nextDirection: MGPOptional<LodestoneDirection> = state.nextLodestoneDirection();
        if (nextDirection.isPresent()) {
            return [nextDirection.get()];
        } else {
            return ['push', 'pull'];
        }
    }
}
