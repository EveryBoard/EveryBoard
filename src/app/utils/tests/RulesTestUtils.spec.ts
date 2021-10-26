import { AbstractGameState } from 'src/app/jscaip/GameState';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Move } from 'src/app/jscaip/Move';
import { Rules } from 'src/app/jscaip/Rules';

export class RulesUtils {

    public static expectMoveSuccess(rules: Rules<Move, AbstractGameState>,
                                    state: AbstractGameState,
                                    move: Move,
                                    expectedState: AbstractGameState)
    : void
    {
        const legality: LegalityStatus = rules.isLegal(move, state);
        expect(legality.legal).toBeTruthy();
        if (legality.legal.isSuccess()) {
            const resultingState: AbstractGameState = rules.applyLegalMove(move, state, legality);
            expect(resultingState.equals(expectedState)).withContext('state should be equals').toBeTrue();
        } else {
            throw new Error('expected move to be valid but it is not: ' + legality.legal.getReason());
        }
    }
    public static expectMoveFailure(rules: Rules<Move, AbstractGameState>,
                                    state: AbstractGameState,
                                    move: Move,
                                    reason: string)
    : void
    {
        const legality: LegalityStatus = rules.isLegal(move, state);
        expect(legality.legal.reason).toBe(reason);
    }
}
