import { MGPOptional } from '@everyboard/lib';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { ApagosMove } from './ApagosMove';
import { ApagosConfig, ApagosNode, ApagosRules } from './ApagosRules';
import { ApagosState } from './ApagosState';
import { Player } from 'src/app/jscaip/Player';

export class ApagosMoveGenerator extends MoveGenerator<ApagosMove, ApagosState, ApagosConfig> {

    public override getListMoves(node: ApagosNode, config: MGPOptional<ApagosConfig>): ApagosMove[] {
        const state: ApagosState = node.gameState;
        const moves: ApagosMove[] = [];
        for (let x: number = 0; x < config.get().width; x++) {
            moves.push(ApagosMove.drop(x, Player.ZERO));
            moves.push(ApagosMove.drop(x, Player.ONE));
            for (let smallerX: number = 0; smallerX < x; smallerX++) {
                moves.push(ApagosMove.transfer(x, smallerX).get());
            }
        }
        function isLegal(move: ApagosMove): boolean {
            return ApagosRules.get().isLegal(move, state).isSuccess();
        }
        return moves.filter(isLegal);
    }
}
