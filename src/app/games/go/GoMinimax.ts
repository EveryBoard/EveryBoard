import { GoPartSlice, Phase } from './GoPartSlice';
import { GoMove } from './GoMove';
import { GoLegalityStatus } from './GoLegalityStatus';
import { display } from 'src/app/utils/utils';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { GoNode, GoRules } from './GoRules';


export class GoMinimax extends Minimax<GoMove, GoPartSlice, GoLegalityStatus> {

    public getListMoves(node: GoNode): GoMove[] {
        const LOCAL_VERBOSE: boolean = false;
        display(GoRules.VERBOSE || LOCAL_VERBOSE, 'GoRules.getListMoves');

        const currentSlice: GoPartSlice = node.gamePartSlice;
        const playingMoves: GoMove[] = GoRules.getPlayingMovesList(currentSlice);
        if (currentSlice.phase === Phase.PLAYING ||
            currentSlice.phase === Phase.PASSED) {
            playingMoves.push(GoMove.PASS);
            return playingMoves;
        } else if (currentSlice.phase === Phase.COUNTING ||
            currentSlice.phase === Phase.ACCEPT) {
            display(GoRules.VERBOSE || LOCAL_VERBOSE, 'GoRules.getListMoves in counting phase');
            const markingMoves: GoMove[] = GoRules.getCountingMovesList(currentSlice);
            if (markingMoves.length === 0) {
                markingMoves.push(GoMove.ACCEPT);
            }
            return markingMoves;
        } else {
            return [];
        }
    }
    public getBoardValue(node: GoNode): NodeUnheritance {
        const slice: GoPartSlice = node.gamePartSlice;
        const LOCAL_VERBOSE: boolean = false;

        display(GoRules.VERBOSE || LOCAL_VERBOSE, 'GoRules.getBoardValue');

        const goPartSlice: GoPartSlice = GoRules.markTerritoryAndCount(slice);

        const goScore: number[] = goPartSlice.getCapturedCopy();
        const goKilled: number[] = GoRules.getDeadStones(goPartSlice);
        return new NodeUnheritance((goScore[1] + (2 * goKilled[0])) - (goScore[0] + (2 * goKilled[1])));
    }
}
