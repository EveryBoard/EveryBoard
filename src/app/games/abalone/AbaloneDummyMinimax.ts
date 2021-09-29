import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPSet } from 'src/app/utils/MGPSet';
import { AbaloneState } from './AbaloneState';
import { AbaloneMove } from './AbaloneMove';
import { AbaloneLegalityStatus, AbaloneNode, AbaloneRules } from './AbaloneRules';
import { Player } from 'src/app/jscaip/Player';

export class AbaloneDummyMinimax extends Minimax<AbaloneMove, AbaloneState, AbaloneLegalityStatus> {

    public getListMoves(node: AbaloneNode): AbaloneMove[] {
        const moves: AbaloneMove[] = [];
        const state: AbaloneState = node.gameState;
        const PLAYER: Player = state.getCurrentPlayer();
        for (let y: number = 0; y < 9; y++) {
            for (let x: number = 0; x < 9; x++) {
                const first: Coord = new Coord(x, y);
                if (state.getBoardAt(first).is(PLAYER) === false) {
                    continue;
                }
                for (const dir of HexaDirection.factory.all) {
                    const move: AbaloneMove = AbaloneMove.fromSingleCoord(first, dir).get();
                    if (this.isAcceptablePush(move, state)) {
                        moves.push(move);
                    } else {
                        continue;
                    }
                    for (const alignement of HexaDirection.factory.all) {
                        for (let distance: number = 1; distance <= 2; distance++) {
                            if (alignement.equals(dir)) {
                                break;
                            }
                            const second: Coord = first.getNext(alignement, distance);
                            if (second.isInRange(9, 9)) {
                                const translation: AbaloneMove = AbaloneMove.fromDoubleCoord(first, second, dir).get();
                                if (AbaloneRules.isLegal(translation, state).legal.isSuccess()) {
                                    moves.push(translation);
                                }
                            } else {
                                break;
                            }
                        }
                    }
                }
            }
        }
        return new MGPSet(moves).getCopy();
    }
    private isAcceptablePush(move: AbaloneMove, state: AbaloneState): boolean {
        const scores: [number, number] = state.getScores();
        const status: AbaloneLegalityStatus = AbaloneRules.isLegal(move, state);
        if (status.legal.isSuccess()) {
            const ENEMY: number = state.getCurrentEnnemy().value;
            const newState: AbaloneState = new AbaloneState(status.newBoard, state.turn + 1);
            const newScores: [number, number] = newState.getScores();
            if (newScores[ENEMY] > scores[ENEMY]) {
                return false; // he just pushed himself
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    public getBoardValue(node: AbaloneNode): NodeUnheritance {
        const gameStatus: GameStatus = AbaloneRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        const scores: [number, number] = node.gameState.getScores();
        return new NodeUnheritance(scores[1] - scores[0]);
    }
}
