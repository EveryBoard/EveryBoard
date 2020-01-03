export abstract class Mouvement {

    abstract bouge(): String;
}

export abstract class Plateau {

    abstract applique(mouvement: Mouvement): boolean;
}

export abstract class Regle<M extends Mouvement, P extends Plateau> {

    public noeud: Noeud<Regle<M, P>, M, P>;

    public abstract donneMouvement(plateau: P): Array<{m: M, p: P}> ;
}

export class Noeud<R extends Regle<M, P>, M extends Mouvement, P extends Plateau> {

    public reglementeur: R;
}

export class JeuMouvement extends Mouvement {

    bouge(): String {
        return "JeuMouvement"
    }
}

export class JeuPlateau extends Plateau {

    applique(mouvement: JeuMouvement): boolean {
        return mouvement == null;
    }
}

export class JeuRegle extends Regle<JeuMouvement, JeuPlateau> {

    public noeud: Noeud<JeuRegle, JeuMouvement, JeuPlateau>;

    public donneMouvement(plateau: JeuPlateau): Array<{m: JeuMouvement, p: JeuPlateau}> {
        return [];
    }
}