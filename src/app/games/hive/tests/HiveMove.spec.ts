/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { HiveMove } from '../HiveMove';
import { HivePiece } from '../HivePiece';

describe('HiveMove', () => {
    const drop: HiveMove = HiveMove.drop(new HivePiece(Player.ZERO, 'QueenBee'), new Coord(0, 0));
    const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(1, 0)).get();
    const spiderMove: HiveMove = HiveMove.spiderMove([
        new Coord(0, 0), new Coord(1, 0), new Coord(2, 0), new Coord(3, 0),
    ]);
    it('should fail to create static moves', () => {
        // When creating a static move
        const move: MGPFallible<HiveMove> = HiveMove.move(new Coord(0, 0), new Coord(0, 0));
        // Then it should fail
        expect(move.isSuccess()).toBeFalse();
        const reason: string = RulesFailure.MOVE_CANNOT_BE_STATIC();
        expect(move.getReason()).toBe(reason);
    });
    it('should redefine toString', () => {
        expect(drop.toString()).toEqual('HiveDrop(QueenBee_PLAYER_ZERO, (0, 0))');
        expect(move.toString()).toEqual('HiveMoveCoordToCoord((0, 0) -> (1, 0))');
        expect(spiderMove.toString()).toEqual('HiveMoveSpider((0, 0), (1, 0), (2, 0), (3, 0))');
        expect(HiveMove.PASS.toString()).toEqual('HiveMovePass');
    });
    it('should define equality', () => {
        expect(drop.equals(drop)).toBeTrue();
        expect(drop.equals(move)).toBeFalse();
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(drop)).toBeFalse();
        expect(spiderMove.equals(spiderMove)).toBeTrue();
        expect(HiveMove.PASS.equals(move)).toBeFalse();
    });
    it('should not consider regular move equal to spiderMove even if they have the same start and end', () => {
        const regularMove: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(3, 0)).get();
        const similarSpiderMove: HiveMove = spiderMove;
        expect(regularMove.equals(similarSpiderMove)).toBeFalse();
        expect(similarSpiderMove.equals(regularMove)).toBeFalse();
    });
    it('should encode and decode all types of moves correctly', () => {
        const moves: HiveMove[] = [drop, move, spiderMove, HiveMove.PASS];
        for (const move of moves) {
            EncoderTestUtils.expectToBeCorrect(HiveMove.encoder, move);
        }
    });
    it('should encode and decode all pieces correctly', () => {
        const drops: HiveMove[] = [
            HiveMove.drop(new HivePiece(Player.ZERO, 'QueenBee'), new Coord(0, 0)),
            HiveMove.drop(new HivePiece(Player.ZERO, 'Beetle'), new Coord(0, 0)),
            HiveMove.drop(new HivePiece(Player.ZERO, 'Grasshopper'), new Coord(0, 0)),
            HiveMove.drop(new HivePiece(Player.ZERO, 'Spider'), new Coord(0, 0)),
            HiveMove.drop(new HivePiece(Player.ZERO, 'SoldierAnt'), new Coord(0, 0)),
        ];
        for (const move of drops) {
            EncoderTestUtils.expectToBeCorrect(HiveMove.encoder, move);
        }
    });
});
