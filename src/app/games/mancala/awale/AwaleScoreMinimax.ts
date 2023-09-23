import { AwaleMove } from './AwaleMove';
import { AwaleRules } from './AwaleRules';
import { AwaleMoveGenerator } from './AwaleMoveGenerator';
import { MancalaScoreMinimax } from '../common/MancalaScoreMinimax';

export class AwaleScoreMinimax extends MancalaScoreMinimax<AwaleMove> {

    public constructor() {
        super(AwaleRules.get(), new AwaleMoveGenerator());
    }
}
