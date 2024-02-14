import { GobanConfig } from 'src/app/jscaip/GobanConfig';

export type PenteConfig = GobanConfig & {

    captureNeededToWin: number;

    nInARow: number;

    sizeOfSandwich: number;

};
