import { MGPNode } from 'src/app/jscaip/MGPNode';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MartianChessMove } from './MartianChessMove';
import { MartianChessState } from './MartianChessState';

export class MartianChessNode extends MGPNode<Rules<MartianChessMove, MartianChessState>,
                                              MartianChessMove,
                                              MartianChessState> {}

export class MartianChessRules extends Rules<MartianChessMove, MartianChessState> {

    public applyLegalMove(move: MartianChessMove, state: MartianChessState, info: void): MartianChessState {
        throw new Error('Method not implemented.');
    }
    public isLegal(move: MartianChessMove, state: MartianChessState): MGPFallible<void> {

    }
    public getGameStatus(node: MartianChessNode): GameStatus {
        throw new Error('Method not implemented.');
    }
}
