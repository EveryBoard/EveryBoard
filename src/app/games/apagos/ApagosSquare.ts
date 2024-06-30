import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPFallible, MGPMap } from '@everyboard/lib';

export class ApagosSquare {

    public static from(nbZero: number, nbOne: number, nbTotal: number): MGPFallible<ApagosSquare> {
        if (nbZero + nbOne > nbTotal) {
            return MGPFallible.failure('invalid starting space');
        }
        const containing: MGPMap<PlayerOrNone, number> = new MGPMap<PlayerOrNone, number>([
            { key: Player.ZERO, value: nbZero },
            { key: Player.ONE, value: nbOne },
            { key: PlayerOrNone.NONE, value: nbTotal },
        ]);
        containing.makeImmutable();
        const validSquare: ApagosSquare = new ApagosSquare(containing);
        return MGPFallible.success(validSquare);
    }

    private constructor(private readonly containing: MGPMap<PlayerOrNone, number>) {}

    public isFull(): boolean {
        const nbZero: number = this.count(Player.ZERO);
        const nbOne: number = this.count(Player.ONE);
        const nbTotal: number = this.count(PlayerOrNone.NONE);
        return nbTotal <= (nbZero + nbOne);
    }

    public count(player: PlayerOrNone): number {
        return this.containing.get(player).get();
    }

    public getCapacity(): number {
        return this.count(PlayerOrNone.NONE);
    }

    public addPiece(piece: Player): ApagosSquare {
        let nbZero: number = this.count(Player.ZERO);
        let nbOne: number = this.count(Player.ONE);
        const nbTotal: number = this.count(PlayerOrNone.NONE);
        if (piece === Player.ZERO) {
            nbZero++;
        } else {
            nbOne++;
        }
        return ApagosSquare.from(nbZero, nbOne, nbTotal).get();
    }

    public substractPiece(piece: Player): ApagosSquare {
        let nbZero: number = this.count(Player.ZERO);
        let nbOne: number = this.count(Player.ONE);
        const nbTotal: number = this.count(PlayerOrNone.NONE);
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
        return this.containing.equals(other.containing);
    }

    public toString(): string {
        const zero: number = this.containing.get(PlayerOrNone.ZERO).get();
        const one: number = this.containing.get(PlayerOrNone.ONE).get();
        const none: number = this.containing.get(PlayerOrNone.NONE).get();
        return `(${zero}, ${one}, ${none})`;
    }
}
