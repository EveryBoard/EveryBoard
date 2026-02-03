import { MancalaMoveGenerator } from '../common/MancalaMoveGenerator';
import { AwaleRules } from './AwaleRules';

export class AwaleMoveGenerator extends MancalaMoveGenerator {

    public constructor() {
        super(AwaleRules.get());
    }

}
