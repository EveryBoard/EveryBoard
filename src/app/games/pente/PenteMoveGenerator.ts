import { MGPOptional } from '@everyboard/lib';

import { MoveGenerator } from '../../jscaip/AI/AI';
import { Coord } from '../../jscaip/Coord';
import { PlayerOrNone } from '../../jscaip/Player';

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
