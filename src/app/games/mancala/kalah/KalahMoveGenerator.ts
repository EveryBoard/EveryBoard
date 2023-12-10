import { KalahRules } from './KalahRules';
import { MancalaMoveGenerator } from '../common/MancalaMoveGenerator';

export class KalahMoveGenerator extends MancalaMoveGenerator {

    public constructor() {
        super(KalahRules.get());
    }

}
