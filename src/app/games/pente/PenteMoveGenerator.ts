import { MGPOptional } from '@everyboard/lib';

import { PlayerOrNone } from '../../jscaip/Player';
import { PenteState } from './PenteState';
import { PenteMove } from './PenteMove';
import { PenteNode } from './PenteRules';
import { Coord } from '../../jscaip/Coord';
import { MoveGenerator } from '../../jscaip/AI/AI';
import { PenteConfig } from './PenteConfig';

export class PenteMoveGenerator extends MoveGenerator<PenteMove, PenteState, PenteConfig> {

    public override getListMoves(node: PenteNode, _config: MGPOptional<PenteConfig>): PenteMove[] {
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
