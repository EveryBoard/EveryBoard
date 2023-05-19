import { MGPNode } from 'src/app/jscaip/MGPNode';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { PenteMove } from './PenteMove';
import { PenteState } from './PenteState';

export class PenteNode extends MGPNode<Rules<PenteMove, PenteState>,
                                       PenteMove,
                                       PenteState> {}

export class PenteRules extends Rules<PenteMove, PenteState> {

    private static singleton: MGPOptional<PenteRules> = MGPOptional.empty();

    public static get(): PenteRules {
        if (PenteRules.singleton.isAbsent()) {
            PenteRules.singleton = MGPOptional.of(new PenteRules());
        }
        return PenteRules.singleton.get();
    }
    /**
     * The constructor is made private to avoid creating other instances of this class.
     */
    private constructor() {
        super(PenteState);
    }

    public isLegal(move: PenteMove, state: PenteState): MGPValidation {
        // A move is legal if:
        //   - it is on the board (ensured by construction)
        //   - it does not erase a piece
        throw new Error('NYI');
    }
    public applyLegalMove(move: PenteMove, state: PenteState, info: void): PenteState {
        // Add the piece on the board
        // Perform captures if needed
        throw new Error('NYI');
    }
    public getGameStatus(node: PenteNode): GameStatus {
        // Use Nin arow helper
        throw new Error('NYI');
    }
}
