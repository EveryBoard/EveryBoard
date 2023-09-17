import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { PlayerMetricsMinimax } from 'src/app/jscaip/Minimax';
import { MGPSet } from 'src/app/utils/MGPSet';
import { AbaloneState } from './AbaloneState';
import { AbaloneMove } from './AbaloneMove';
import { AbaloneLegalityInformation, AbaloneNode, AbaloneRules } from './AbaloneRules';
import { Player } from 'src/app/jscaip/Player';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

export class AbaloneDummyMinimax
    extends PlayerMetricsMinimax<AbaloneMove, AbaloneState, RulesConfig, AbaloneLegalityInformation>
{
    public getListMoves(node: AbaloneNode): AbaloneMove[] {
        const moves: AbaloneMove[] = [];
        const state: AbaloneState = node.gameState;
        const player: Player = state.getCurrentPlayer();
        for (let y: number = 0; y < 9; y++) {
            for (let x: number = 0; x < 9; x++) {
                const first: Coord = new Coord(x, y);
                if (state.getPieceAt(first).is(player) === false) {
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
                            if (AbaloneState.isOnBoard(second)) {
                                const translation: AbaloneMove = AbaloneMove.fromDoubleCoord(first, second, dir).get();
                                if (AbaloneRules.get().isLegal(translation, state).isSuccess()) {
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
        return new MGPSet(moves).toList();
    }
    private isAcceptablePush(move: AbaloneMove, state: AbaloneState): boolean {
        const scores: [number, number] = state.getScores();
        const status: MGPFallible<AbaloneLegalityInformation> = AbaloneRules.get().isLegal(move, state);
        if (status.isSuccess()) {
            const OPPONENT: number = state.getCurrentOpponent().value;
            const newState: AbaloneState = new AbaloneState(status.get(), state.turn + 1);
            const newScores: [number, number] = newState.getScores();
            if (newScores[OPPONENT] > scores[OPPONENT]) {
                return false; // some player just push themself
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    public getMetrics(node: AbaloneNode): [number, number] {
        return node.gameState.getScores();
    }
}
