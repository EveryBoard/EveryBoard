import { MancalaDistribution } from '../MancalaMove';
import { TestUtils } from 'src/app/utils/tests/TestUtils.spec';

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
