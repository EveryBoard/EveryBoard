import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { RectanglzMove } from './RectanglzMove';
import { RectanglzNode, RectanglzRules } from './RectanglzRules';
import { RectanglzState } from './RectanglzState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Coord } from 'src/app/jscaip/Coord';

export class RectanglzMoveGenerator extends MoveGenerator<RectanglzMove, RectanglzState> {

    public rules: RectanglzRules = RectanglzRules.get();

    public override getListMoves(node: RectanglzNode, _config: NoConfig): RectanglzMove[] {
        const player: Player = node.gameState.getCurrentPlayer();
        const jumps: RectanglzMove[] = [];
        const duplicationMap: MGPMap<Coord, RectanglzMove> = new MGPMap();
        for (const coordAndContent of node.gameState.getCoordsAndContents()) {
            if (coordAndContent.content.equals(player)) {
                const coordMoves: RectanglzMove[] = this.rules.getPossiblesMoves(node.gameState, coordAndContent.coord);
                const coordJumps: RectanglzMove[] = coordMoves.filter((m: RectanglzMove) => m.isJump());
                jumps.push(...coordJumps);
                const coordDuplications: RectanglzMove[] = coordMoves.filter((m: RectanglzMove) => m.isDuplication());
                for (const duplication of coordDuplications) {
                    duplicationMap.put(duplication.getEnd(), duplication);
                }
            }
        }
        const duplications: RectanglzMove[] = duplicationMap.getValueList();
        console.log(jumps.concat(duplications), 'moves at turn', node.gameState.turn)
        return jumps.concat(duplications);
    }
}
