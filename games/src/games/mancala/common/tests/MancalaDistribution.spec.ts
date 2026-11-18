import { TestUtils } from '@everyboard/lib/testing';

import { MancalaDistribution } from '../MancalaMove';

describe('MancalaDistribution', () => {

    describe('of', () => {

        it('should throw when creating negative x indices', () => {
            TestUtils.expectToThrowAndLog(
                () => MancalaDistribution.of('CLOCKWISE', -1, 0),
                'MancalaDistribution.coord.x should be a positive integer!',
            );
        });

        it('should throw when creating negative y indices', () => {
            TestUtils.expectToThrowAndLog(
                () => MancalaDistribution.of('CLOCKWISE', 0, -1),
                'MancalaDistribution.coord.y should be a positive integer!',
            );
        });

    });

});
