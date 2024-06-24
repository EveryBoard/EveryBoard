import { HexodiaState } from './HexodiaState';
import { HexodiaConfig, HexodiaNode } from './HexodiaRules';
import { HexodiaMove } from './HexodiaMove';
import { Coord } from 'src/app/jscaip/Coord';
import { TableUtils } from 'src/app/jscaip/TableUtils';
import { MGPOptional, Set } from '@everyboard/lib';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

export class HexodiaMoveGenerator extends MoveGenerator<HexodiaMove, HexodiaState, HexodiaConfig> {

    public override getListMoves(node: HexodiaNode, _config: MGPOptional<HexodiaConfig>): HexodiaMove[] {
        if (node.gameState.turn === 0) {
            return this.getFirstMove(node.gameState);
        } else {
            return this.getListDrops(node);
        }
    }

    private getFirstMove(state: HexodiaState): HexodiaMove[] {
        const width: number = state.getWidth();
        const height: number = state.getHeight();
        const cx: number = Math.floor(width / 2);
        const cy: number = Math.floor(height / 2);
        const center: Coord = new Coord(cx, cy);
        return [
            HexodiaMove.of([center]),
        ];
    }

    private getListDrops(node: HexodiaNode): HexodiaMove[] {
        const availableFirstCoords: Coord[] = this.getAvailableCoords(node.gameState);
        const moves: HexodiaMove[] = [];
        for (const firstCoord of availableFirstCoords) {
            const board: FourStatePiece[][] = node.gameState.getCopiedBoard();
            board[firstCoord.y][firstCoord.x] = FourStatePiece.ofPlayer(node.gameState.getCurrentPlayer());
            const stateAfterFirstDrops: HexodiaState =
                new HexodiaState(board, node.gameState.turn);
            const availableSecondCoords: Coord[] = this.getAvailableCoords(stateAfterFirstDrops);
            for (const secondCoord of availableSecondCoords) {
                const newMove: HexodiaMove = HexodiaMove.of([firstCoord, secondCoord]);
                moves.push(newMove);
            }
        }
        return new Set(moves).toList(); // Removes duplicates
    }

    private getAvailableCoords(state: HexodiaState): Coord[] {
        const usefulCoord: boolean[][] = this.getUsefulCoordsMap(state);
        const availableCoords: Coord[] = [];
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            if (usefulCoord[coord.y][coord.x] === true && coordAndContent.content === FourStatePiece.EMPTY) {
                availableCoords.push(coord);
            }
        }
        return availableCoords;
    }

    /**
     * This function returns a table on which table[y][x] === true only if:
     *     (x, y) is empty but has occupied neighbors
     */
    private getUsefulCoordsMap(state: HexodiaState): boolean[][] {
        const width: number = state.getWidth();
        const height: number = state.getHeight();
        const usefulCoord: boolean[][] = TableUtils.create(width, height, false);
        for (const coordAndContent of state.getPlayerCoordsAndContent()) {
            this.addNeighboringCoord(usefulCoord, coordAndContent.coord);
        }
        return usefulCoord;
    }

    /**
     * mark the space neighboring coord as "space that have an occupied neighbor"
     * @param usefulCoord a map of the board which each space mapped to true if it has an occupied neighbor
     * @param coord the coord to add to this map
     */
    private addNeighboringCoord(usefulCoord: boolean[][], coord: Coord): void {
        const usefulDistance: number = 1; // At two, it's already too much calculation for the minimax sadly
        const width: number = usefulCoord[0].length;
        const height: number = usefulCoord.length;
        const minX: number = Math.max(0, coord.x - usefulDistance);
        const minY: number = Math.max(0, coord.y - usefulDistance);
        const maxX: number = Math.min(width - 1, coord.x + usefulDistance);
        const maxY: number = Math.min(height - 1, coord.y + usefulDistance);
        for (let y: number = minY; y <= maxY; y++) {
            for (let x: number = minX; x <= maxX; x++) {
                usefulCoord[y][x] = true;
            }
        }
    }

}
