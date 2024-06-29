import { MancalaDistribution } from '../MancalaMove';
import { TestUtils } from '@everyboard/lib';

describe('MancalaDistribution', () => {

    describe('of', () => {

        it('should throw when creating negative x indices', () => {
            TestUtils.expectToThrowAndLog(
                () => MancalaDistribution.of(-1),
                'MancalaDistribution should be a positive integer!',
            );
        });

    });

});
