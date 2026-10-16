import { MinimalUser } from './MinimalUser';

export type PlayerInfo = {
    readonly user: MinimalUser;
    readonly elo: number;
};
