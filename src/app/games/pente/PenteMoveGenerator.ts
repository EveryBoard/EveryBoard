import { PlayerOrNone } from '@everyboard/games';
import { MoveGenerator } from '@everyboard/games';
import { Coord } from '@everyboard/games';

import { PenteConfig } from './PenteConfig';
import { PenteMove } from './PenteMove';
import { PenteNode } from './PenteRules';
import { PenteState } from './PenteState';

export class PenteMoveGenerator extends MoveGenerator<PenteMove, PenteState, PenteConfig> {

    public override getListMoves(node: PenteNode, _config: PenteConfig): PenteMove[] {
        const state: PenteState = node.gameState;
        const moves: PenteMove[] = [];
        state.forEachCoord((coord: Coord, content: PlayerOrNone): void => {
            if (content.isNone()) {
                moves.push(PenteMove.of(coord));
            }
        });
        return moves;
    }

}
