import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {P4Rules} from './P4Rules';
import {MoveX} from '../../jscaip/MoveX';

describe('P4Rules', () => {

	it('should be created', () => {
		expect(new P4Rules()).toBeTruthy();
	});

	it('should be an end game', () => {
		const part = new P4Rules();
		part.choose(MoveX.get(3));
		part.choose(MoveX.get(2));
		part.choose(MoveX.get(3));
		part.choose(MoveX.get(2));
		part.choose(MoveX.get(3));
		part.choose(MoveX.get(2));
		part.choose(MoveX.get(3));
		expect(part.getBoardValue(part.node)).toEqual(Number.MIN_SAFE_INTEGER);
	});

	it('should be an end game', () => {
		const part = new P4Rules();
		part.choose(MoveX.get(6));
		part.choose(MoveX.get(2));
		part.choose(MoveX.get(3));
		part.choose(MoveX.get(2));
		part.choose(MoveX.get(3));
		part.choose(MoveX.get(2));
		part.choose(MoveX.get(3));
		part.choose(MoveX.get(2));
		expect(part.getBoardValue(part.node)).toEqual(Number.MAX_SAFE_INTEGER);
	});

	it('should be an end game', () => {
		const part = new P4Rules();
		part.choose(MoveX.get(3));
		part.choose(MoveX.get(3));

		part.choose(MoveX.get(2)); // two in a line
		part.choose(MoveX.get(1)); // left block

		part.choose(MoveX.get(4)); // three in a line
		part.choose(MoveX.get(5)); // right block

		part.choose(MoveX.get(5)); // start over and don't win
		expect(part.getBoardValue(part.node)).toBeLessThan(Number.MAX_SAFE_INTEGER);
	});

	it('should be an end game', () => {
		const part = new P4Rules();
		part.choose(MoveX.get(3));
		part.choose(MoveX.get(3));

		part.choose(MoveX.get(2)); // two in a line
		part.choose(MoveX.get(1)); // left block

		part.choose(MoveX.get(4)); // three in a line
		part.choose(MoveX.get(5)); // right block

		part.choose(MoveX.get(1)); // start over another pawn and don't win
		expect(part.getBoardValue(part.node)).toBeLessThan(Number.MAX_SAFE_INTEGER);
	});
});