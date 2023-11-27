import { Encoder } from '@everyboard/lib';
import { EncoderTestUtils } from '@everyboard/lib';
import { GameState } from '../GameState';
import { GameNode } from '../GameNode';
import { Move } from '../Move';
import { Rules } from '../Rules';
import { MoveGenerator } from '../AI';

export class MoveTestUtils {
    public static testFirstTurnMovesBijectivity<M extends Move, S extends GameState, L>(
        rules: Rules<M, S, L>,
        generator: MoveGenerator<M, S>,
        encoder: Encoder<M>,
    ): void
    {
        const node: GameNode<M, S> = rules.getInitialNode();
        const moves: M[] = generator.getListMoves(node);
        for (const move of moves) {
            EncoderTestUtils.expectToBeBijective(encoder, move);
        }
    }
}
