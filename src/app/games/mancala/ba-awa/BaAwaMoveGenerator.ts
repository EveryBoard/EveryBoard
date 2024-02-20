import { BaAwaRules } from './BaAwaRules';
import { MancalaMoveGenerator } from '../common/MancalaMoveGenerator';

export class BaAwaMoveGenerator extends MancalaMoveGenerator {

    public constructor() {
        super(BaAwaRules.get());
    }

}
