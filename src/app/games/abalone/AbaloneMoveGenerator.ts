import { Player } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { MoveGenerator } from '@everyboard/games';
import { Coord } from '@everyboard/games';
import { HexaDirection } from '@everyboard/games';
import { MGPFallible, Set } from '@everyboard/lib';

import { AbaloneMove } from './AbaloneMove';
import { AbaloneConfig, AbaloneLegalityInformation, AbaloneNode, AbaloneRules } from './AbaloneRules';
import { AbaloneState } from './AbaloneState';

export class AbaloneMoveGenerator extends MoveGenerator<AbaloneMove, AbaloneState, AbaloneConfig> {

    public override getListMoves(node: AbaloneNode, config: AbaloneConfig): AbaloneMove[] {
        const moves: AbaloneMove[] = [];
        const state: AbaloneState = node.gameState;
        const player: Player = state.getCurrentPlayer();
        for (const coordAndContent of state.getCoordsAndContents()) {
            const first: Coord = coordAndContent.coord;
            if (state.getPieceAt(first).is(player) === false) {
                continue;
            }
            for (const dir of HexaDirection.factory.all) {
                const move: AbaloneMove = AbaloneMove.ofSingleCoord(first, dir);
                if (this.isAcceptablePush(move, state, config)) {
                    moves.push(move);
                } else {
                    continue;
                }
                for (const alignment of HexaDirection.factory.all) {
                    for (let distance: number = 1; distance <= 2; distance++) {
                        if (alignment.equals(dir)) {
                            break;
                        }
                        const second: Coord = first.getNext(alignment, distance);
                        if (state.isOnBoard(second)) {
                            const translation: AbaloneMove = AbaloneMove.ofDoubleCoord(first, second, dir);
                            if (AbaloneRules.get().isLegal(translation, state, config).isSuccess()) {
                                moves.push(translation);
                            }
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        return new Set(moves).toList();
    }

    private isAcceptablePush(move: AbaloneMove, state: AbaloneState, config: AbaloneConfig): boolean {
        const scores: PlayerNumberMap = state.getScores();
        const status: MGPFallible<AbaloneLegalityInformation> = AbaloneRules.get().isLegal(move, state, config);
        if (status.isSuccess()) {
            const opponent: Player = state.getCurrentOpponent();
            const newState: AbaloneState = new AbaloneState(status.get(), state.turn + 1);
            const newScores: PlayerNumberMap = newState.getScores();
            if (scores.get(opponent) < newScores.get(opponent)) {
                return false; // some player just push themself
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
}
