import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PenteState } from './PenteState';
import { PenteMove } from './PenteMove';
import { PenteNode } from './PenteRules';
import { Coord } from 'src/app/jscaip/Coord';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { MGPOptional } from '@everyboard/lib';
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
