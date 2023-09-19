import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MancalaDistribution } from './MancalaMove';

describe('MancalaDistribution', () => {

    describe('of', () => {

        it('should throw when creating negative x indexes', () => {
            RulesUtils.expectToThrowAndLog(() => MancalaDistribution.of(-1),
                                           'MancalaDistribution should be a positive integer!');
        });
    });

});
