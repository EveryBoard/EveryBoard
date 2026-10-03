import { TestUtils } from '@everyboard/lib/testing';

import { MancalaDistribution } from '../MancalaMove';

describe('MancalaDistribution', () => {

    describe('of', () => {

        it('should throw when creating negative x indices', () => {
            TestUtils.expectToThrowAndLog(
                () => MancalaDistribution.of(-1, 0),
                'MancalaDistribution.x should be a positive integer!',
            );
        });

        it('should throw when creating negative y indices', () => {
            TestUtils.expectToThrowAndLog(
                () => MancalaDistribution.of(0, -1),
                'MancalaDistribution.y should be a positive integer!',
            );
        });

    });

});
