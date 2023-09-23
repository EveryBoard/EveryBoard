import { KalahMove } from './KalahMove';
import { KalahRules } from './KalahRules';
import { KalahMoveGenerator } from './KalahMoveGenerator';
import { MancalaScoreMinimax } from '../common/MancalaScoreMinimax';

export class KalahScoreMinimax extends MancalaScoreMinimax<KalahMove> {

    public constructor() {
        super(KalahRules.get(), new KalahMoveGenerator());
    }
}
