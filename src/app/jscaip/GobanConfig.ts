import { MGPOptional } from '../utils/MGPOptional';

export type GobanConfig = {
    width: number;
    height: number;
};

export const defaultGobanConfig: MGPOptional<GobanConfig> = MGPOptional.of({
    width: 19,
    height: 19,
});
