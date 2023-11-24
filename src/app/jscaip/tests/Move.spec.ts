import { Encoder } from 'src/app/utils/Encoder';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { GameState } from '../GameState';
import { GameNode } from '../AI/GameNode';
import { Move } from '../Move';
import { Rules } from '../Rules';
import { MoveGenerator } from '../AI/AI';

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
