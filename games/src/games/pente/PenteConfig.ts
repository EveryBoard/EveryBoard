import { GobanConfig } from '../../jscaip/GobanConfig';

export type PenteConfig = GobanConfig & {

    capturesNeededToWin: number;

    nInARow: number;

    sizeOfSandwich: number;

};
