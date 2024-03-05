import { GobanConfig } from 'src/app/jscaip/GobanConfig';

export type PenteConfig = GobanConfig & {

    capturesNeededToWin: number;

    nInARow: number;

    sizeOfSandwich: number;

};
