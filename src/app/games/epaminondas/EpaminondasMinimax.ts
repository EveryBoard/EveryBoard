
export class EpaminondasMinimax extends Minimax<EpaminondasMove, EpaminondasState, EpaminondasLegalityInformation> {

    public constructor() {
        super('Minimax', EpaminondasRules.get(), new EpaminondasHeuristic(), new EpaminondasMoveGenerator());
    }
}
