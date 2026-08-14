import { GobanConfig } from '@everyboard/games';

export type PenteConfig = GobanConfig & {

    capturesNeededToWin: number;

    nInARow: number;

    sizeOfSandwich: number;

};
