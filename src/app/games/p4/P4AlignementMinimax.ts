import { AlignementMinimax, BoardInfo } from 'src/app/jscaip/AlignementMinimax';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { P4Move } from './P4Move';
import { P4PartSlice } from './P4PartSlice';
import { P4Node } from './P4Rules';

export class P4AlignementMinimax extends AlignementMinimax<P4Move, P4PartSlice, LegalityStatus, NodeUnheritance> {

    public startSearchingVictorySources(): void {
        throw new Error('Method not implemented.'); // TODO
    }
    public hasNextVictorySource(): boolean {
        throw new Error('Method not implemented.'); // TODO
    }
    public getNextVictorySource(): NodeUnheritance {
        throw new Error('Method not implemented.'); // TODO
    }
    public searchVictoryOnly(victorySource: NodeUnheritance, move: P4Move, state: P4PartSlice): BoardInfo {
        throw new Error('Method not implemented.'); // TODO
    }
    public getBoardInfo(victorySource: NodeUnheritance,
                        move: P4Move,
                        state: P4PartSlice,
                        boardInfo: BoardInfo)
    : BoardInfo
    {
        throw new Error('Method not implemented.'); // TODO
    }
    public getListMoves(node: P4Node): P4Move[] {
        throw new Error('Method not implemented.'); // TODO
    }
    public getBoardValue(move: P4Move, slice: P4PartSlice): NodeUnheritance {
        throw new Error('Method not implemented.'); // TODO
    }
}
