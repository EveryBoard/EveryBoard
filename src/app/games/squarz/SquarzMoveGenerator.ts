import { MGPMap, MGPOptional } from '@everyboard/lib';

import { MoveGenerator } from '../../jscaip/AI/AI';
import { Coord } from '../../jscaip/Coord';
import { Player } from '../../jscaip/Player';
import { SquarzMove } from './SquarzMove';
import { SquarzConfig, SquarzNode, SquarzRules } from './SquarzRules';
import { SquarzState } from './SquarzState';

export class SquarzMoveGenerator extends MoveGenerator<SquarzMove, SquarzState, SquarzConfig> {

    public constructor(private readonly rules: SquarzRules) {
        super();
    }

    public override getListMoves(node: SquarzNode, config: MGPOptional<SquarzConfig>): SquarzMove[] {
        const player: Player = node.gameState.getCurrentPlayer();
        const jumps: SquarzMove[] = [];
        const duplicationMap: MGPMap<Coord, SquarzMove> = new MGPMap();
        for (const coordAndContent of node.gameState.getCoordsAndContents()) {
            if (coordAndContent.content.equals(player)) {
                const coordMoves: SquarzMove[] =
                    this.rules.getPossiblesMoves(node.gameState, coordAndContent.coord, config);
                const coordJumps: SquarzMove[] = [];
                const coordDuplications: SquarzMove[] = [];
                coordMoves.forEach((m: SquarzMove) => {
                    if (m.isDuplication()) coordDuplications.push(m);
                    else coordJumps.push(m);
                });
                jumps.push(...coordJumps);
                for (const duplication of coordDuplications) {
                    // The aim of this is to only have one duplication by landing square
                    duplicationMap.put(duplication.getEnd(), duplication);
                }
            }
        }
        const duplications: SquarzMove[] = duplicationMap.getValueList();
        return jumps.concat(duplications);
    }

}
