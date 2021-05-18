import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { EpaminondasLegalityStatus } from './epaminondaslegalitystatus';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasPartSlice } from './EpaminondasPartSlice';
import { EpaminondasNode, EpaminondasRules } from './EpaminondasRules';

export class PositionalEpaminondasMinimax extends Minimax<EpaminondasMove, EpaminondasPartSlice> {

    public getListMoves(node: EpaminondasNode): EpaminondasMove[] {
        const PLAYER: number = node.gamePartSlice.getCurrentPlayer().value;
        const ENNEMY: number = node.gamePartSlice.getCurrentEnnemy().value;
        const EMPTY: number = Player.NONE.value;

        let moves: EpaminondasMove[] = [];
        const slice: EpaminondasPartSlice = node.gamePartSlice;
        let move: EpaminondasMove;
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                const firstCoord: Coord = new Coord(x, y);
                if (slice.getBoardAt(firstCoord) === PLAYER) {
                    for (const direction of Direction.DIRECTIONS) {
                        let movedPieces: number = 1;
                        let nextCoord: Coord = firstCoord.getNext(direction, 1);
                        while (nextCoord.isInRange(14, 12) &&
                            slice.getBoardAt(nextCoord) === PLAYER)
                        {
                            movedPieces += 1;
                            nextCoord = nextCoord.getNext(direction, 1);
                        }
                        let stepSize: number = 1;
                        while (nextCoord.isInRange(14, 12) &&
                            stepSize <= movedPieces &&
                            slice.getBoardAt(nextCoord) === EMPTY)
                        {
                            move = new EpaminondasMove(x, y, movedPieces, stepSize, direction);
                            moves = this.addMove(moves, move, slice);

                            stepSize++;
                            nextCoord = nextCoord.getNext(direction, 1);
                        }
                        if (nextCoord.isInRange(14, 12) &&
                            stepSize <= movedPieces &&
                            slice.getBoardAt(nextCoord) === ENNEMY)
                        {
                            move = new EpaminondasMove(x, y, movedPieces, stepSize, direction);
                            moves = this.addMove(moves, move, slice);
                        }
                    }
                }
            }
        }
        return this.orderMovesByPhalanxSize(moves);
    }
    public addMove(moves: EpaminondasMove[],
                   move: EpaminondasMove,
                   slice: EpaminondasPartSlice)
    : EpaminondasMove[]
    {
        const legality: EpaminondasLegalityStatus = EpaminondasRules.isLegal(move, slice);
        if (legality.legal.isSuccess()) {
            moves.push(move);
        }
        return moves;
    }
    public orderMovesByPhalanxSize(moves: EpaminondasMove[]): EpaminondasMove[] {
        moves.sort((a: EpaminondasMove, b: EpaminondasMove) => {
            return b.movedPieces - a.movedPieces;
        });
        return moves;
    }
    public getBoardValue(move: EpaminondasMove, slice: EpaminondasPartSlice): NodeUnheritance {
        const p0InLine0: number = slice.count(Player.ZERO, 0);
        const p1InLine11: number = slice.count(Player.ONE, 11);
        if (slice.turn % 2 === 0) {
            if (p0InLine0 > p1InLine11) {
                return new NodeUnheritance(Player.ZERO.getVictoryValue());
            }
        } else {
            if (p1InLine11 > p0InLine0) {
                return new NodeUnheritance(Player.ONE.getVictoryValue());
            }
        }
        let lineInvasionsValues: number = 0;
        let totalPieceZero: number = 0;
        let totalPieceOne: number = 0;
        for (let i: number = 0; i < 12; i++) {
            const zeroPoints: number = slice.count(Player.ZERO, i);
            const onePoints: number = slice.count(Player.ONE, i);
            totalPieceZero += zeroPoints;
            totalPieceOne += onePoints;
            lineInvasionsValues -= zeroPoints * Math.pow(2, 12 - i);
            lineInvasionsValues += onePoints * Math.pow(2, i + 1);
        }
        let values: number = lineInvasionsValues + totalPieceOne - totalPieceZero;
        // const nbGroups: number =
        return new NodeUnheritance(values);
    }
}
