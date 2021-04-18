export interface Time {
    seconds: number;
}

// TODO IJoueur and PIJoueur are the same interface, they should be merged
export interface IJoueur {
    pseudo: string;
    email?: string;
    displayName?: string;
    // eslint-disable-next-line camelcase
    last_changed?: Time;
    emailVerified?: boolean;
    state?: string;
}

export interface PIJoueur {
    pseudo?: string;
    email?: string;
    displayName?: string;
    // eslint-disable-next-line camelcase
    last_changed?: Time;
    emailVerified?: boolean;
    state?: string;
}

export interface IJoueurId {
    id: string;
    doc: IJoueur;
}
