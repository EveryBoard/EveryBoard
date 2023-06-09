import { Minimax } from 'src/app/jscaip/Minimax';
import { ConnectSixState } from './ConnectSixState';
import { ConnectSixNode, ConnectSixRules } from './ConnectSixRules';
import { ConnectSixMove } from './ConnectSixMove';
import { Coord } from 'src/app/jscaip/Coord';
import { ConnectSixFirstMove } from './ConnectSixMove';
import { ConnectSixDrops } from './ConnectSixMove';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { SCORE } from 'src/app/jscaip/SCORE';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPSet } from 'src/app/utils/MGPSet';

export class ConnectSixMinimax extends Minimax<ConnectSixMove, ConnectSixState> {

    public override getListMoves(node: ConnectSixNode): ConnectSixMove[] {
        if (node.gameState.turn === 0) {
            return this.getFirstMove();
        } else {
            return this.getListDrops(node);
        }
    }
    private getFirstMove(): ConnectSixFirstMove[] {
        const width: number = ConnectSixState.WIDTH;
        const height: number = ConnectSixState.HEIGHT;
        const cx: number = Math.floor(width/2);
        const cy: number = Math.floor(height/2);
        return [ConnectSixFirstMove.from(new Coord(cx, cy))];
    }
    private getListDrops(node: ConnectSixNode): ConnectSixMove[] {
        const availableFirstCoords: Coord[] = this.getAvailableCoords(node.gameState);
        const moves: ConnectSixDrops[] = [];
        for (const firstCoord of availableFirstCoords) {
            const board: PlayerOrNone[][] = node.gameState.getCopiedBoard();
            board[firstCoord.y][firstCoord.x] = node.gameState.getCurrentPlayer();
            const postFirstDropsState: ConnectSixState = new ConnectSixState(board, node.gameState.turn);
            const availableSecondCoords: Coord[] = this.getAvailableCoords(postFirstDropsState);
            for (const secondCoord of availableSecondCoords) {
                const newMove: ConnectSixDrops = ConnectSixDrops.from(firstCoord, secondCoord).get();
                moves.push(newMove);
            }
        }
        return new MGPSet(moves).toList(); // Removes duplicates
    }
    private getAvailableCoords(state: ConnectSixState): Coord[] {
        const usefullCoord: boolean[][] = this.getUsefullCoords(state);
        const availableCoords: Coord[] = [];
        for (const coordsAndContents of state.getCoordsAndContents()) {
            const coord: Coord = coordsAndContents.coord;
            if (usefullCoord[coord.y][coord.x] === true && coordsAndContents.content.isPlayer() === false) {
                availableCoords.push(coord);
            }
        }
        return availableCoords;
    }
    private getUsefullCoords(state: ConnectSixState): boolean[][] {
        const usefullCoord: boolean[][] = ArrayUtils.createTable(ConnectSixState.WIDTH, ConnectSixState.HEIGHT, false);
        for (const coordsAndContents of state.getCoordsAndContents()) {
            if (coordsAndContents.content.isPlayer()) {
                this.addNeighboringCoord(usefullCoord, coordsAndContents.coord);
            }
        }
        return usefullCoord;
    }
    private addNeighboringCoord(usefullCoord: boolean[][], coord: Coord): void {
        const usefullDistance: number = 1; // At two, it's already slow
        const minX: number = Math.max(0, coord.x - usefullDistance);
        const minY: number = Math.max(0, coord.y - usefullDistance);
        const maxX: number = Math.min(ConnectSixState.WIDTH - 1, coord.x + usefullDistance);
        const maxY: number = Math.min(ConnectSixState.HEIGHT - 1, coord.y + usefullDistance);
        for (let y: number = minY; y <= maxY; y++) {
            for (let x: number = minX; x <= maxX; x++) {
                usefullCoord[y][x] = true;
            }
        }
    }
    public getBoardValue(node: ConnectSixNode): BoardValue {
        const state: ConnectSixState = node.gameState;
        let score: number = 0;
        for (const coordsAndContents of state.getCoordsAndContents()) {
            if (coordsAndContents.content.isPlayer()) {
                const squareScore: number =
                    ConnectSixRules.CONNECT_SIX_HELPER.getSquareScore(state, coordsAndContents.coord);
                const coordScore: SCORE = MGPNode.getScoreStatus(squareScore);
                if (coordScore === SCORE.VICTORY) {
                    return new BoardValue(squareScore);
                }
                score += squareScore;
            }
        }
        return new BoardValue(score);
    }
}
