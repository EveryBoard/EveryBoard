import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { HiveMove } from '../HiveMove';
import { HivePieceQueenBee } from '../HivePiece';

describe('HiveMove', () => {
    const drop: HiveMove = HiveMove.drop(new HivePieceQueenBee(Player.ZERO), 0, 0);
    const move: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(1, 0));
    const spiderMove: HiveMove = HiveMove.spiderMove([
        new Coord(0, 0), new Coord(1, 0), new Coord(2, 0), new Coord(3, 0),
    ]);
    it('should redefine toString', () => {
        expect(drop.toString()).toEqual('HiveDrop(QueenBee_PLAYER_ZERO, (0, 0))');
        expect(move.toString()).toEqual('HiveMoveCoordToCoord((0, 0) -> (1, 0))');
        expect(spiderMove.toString()).toEqual('HiveMoveSpider((0, 0) -> (3, 0))');
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
        const regularMove: HiveMove = HiveMove.move(new Coord(0, 0), new Coord(3, 0));
        const similarSpiderMove: HiveMove = spiderMove;
        expect(regularMove.equals(similarSpiderMove)).toBeFalse();
        expect(similarSpiderMove.equals(regularMove)).toBeFalse();
    });
});
