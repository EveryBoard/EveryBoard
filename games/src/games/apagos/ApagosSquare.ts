import { MGPFallible } from '@everyboard/lib';

import { Player, PlayerOrNone } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerNumberMap';

export class ApagosSquare {

    public static from(nbZero: number, nbOne: number, nbTotal: number): MGPFallible<ApagosSquare> {
        if (nbZero + nbOne > nbTotal) {
            return MGPFallible.failure('invalid starting space');
        }
        const containing: PlayerNumberMap = PlayerNumberMap.of(nbZero, nbOne);
        containing.makeImmutable();
        const validSquare: ApagosSquare = new ApagosSquare(containing, nbTotal);
        return MGPFallible.success(validSquare);
    }

    private constructor(private readonly containing: PlayerNumberMap,
                        private readonly capacity: number) {}

    public isFull(): boolean {
        const nbZero: number = this.count(Player.ZERO);
        const nbOne: number = this.count(Player.ONE);
        return this.capacity <= (nbZero + nbOne);
    }

    public count(player: Player): number {
        return this.containing.get(player);
    }

    public getCapacity(): number {
        return this.capacity;
    }

    public addPiece(piece: Player): ApagosSquare {
        let nbZero: number = this.count(Player.ZERO);
        let nbOne: number = this.count(Player.ONE);
        const nbTotal: number = this.getCapacity();
        if (piece === Player.ZERO) {
            nbZero++;
        } else {
            nbOne++;
        }
        return ApagosSquare.from(nbZero, nbOne, nbTotal).get();
    }

    public subtractPiece(piece: Player): ApagosSquare {
        let nbZero: number = this.count(Player.ZERO);
        let nbOne: number = this.count(Player.ONE);
        const nbTotal: number = this.getCapacity();
        if (piece === Player.ZERO) {
            nbZero--;
        } else {
            nbOne--;
        }
        return ApagosSquare.from(nbZero, nbOne, nbTotal).get();
    }

    public getDominatingPlayer(): PlayerOrNone {
        const nbZero: number = this.count(Player.ZERO);
        const nbOne: number = this.count(Player.ONE);
        if (nbZero > nbOne) {
            return Player.ZERO;
        } else if (nbOne > nbZero) {
            return Player.ONE;
        } else {
            return PlayerOrNone.NONE;
        }
    }

    public equals(other: ApagosSquare): boolean {
        return this.containing.equals(other.containing) && this.capacity === other.capacity;
    }

    public toString(): string {
        const zero: number = this.containing.get(PlayerOrNone.ZERO);
        const one: number = this.containing.get(PlayerOrNone.ONE);
        const none: number = this.capacity;
        return `(${zero}, ${one}, ${none})`;
    }
}
