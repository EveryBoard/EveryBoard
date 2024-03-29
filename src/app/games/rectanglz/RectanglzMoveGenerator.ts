import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { RectanglzMove } from './RectanglzMove';
import { RectanglzConfig, RectanglzNode, RectanglzRules } from './RectanglzRules';
import { RectanglzState } from './RectanglzState';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class RectanglzMoveGenerator extends MoveGenerator<RectanglzMove, RectanglzState, RectanglzConfig> {

    public rules: RectanglzRules = RectanglzRules.get();

    public override getListMoves(node: RectanglzNode, config: MGPOptional<RectanglzConfig>): RectanglzMove[] {
        const player: Player = node.gameState.getCurrentPlayer();
        const jumps: RectanglzMove[] = [];
        const duplicationMap: MGPMap<Coord, RectanglzMove> = new MGPMap();
        for (const coordAndContent of node.gameState.getCoordsAndContents()) {
            if (coordAndContent.content.equals(player)) {
                const coordMoves: RectanglzMove[] =
                    this.rules.getPossiblesMoves(node.gameState, coordAndContent.coord, config);
                const coordJumps: RectanglzMove[] = coordMoves.filter((m: RectanglzMove) => m.isJump());
                jumps.push(...coordJumps);
                const coordDuplications: RectanglzMove[] = coordMoves.filter((m: RectanglzMove) => m.isDuplication());
                for (const duplication of coordDuplications) {
                    duplicationMap.put(duplication.getEnd(), duplication);
                }
            }
        }
        const duplications: RectanglzMove[] = duplicationMap.getValueList();
        return jumps.concat(duplications);
    }

}
