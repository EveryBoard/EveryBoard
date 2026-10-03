export class BaseLayout {
    getTranslationAt(coord) {
        const translationCoord = this.getTranslationCoordAt(coord);
        return `translate(${translationCoord.x}, ${translationCoord.y})`;
    }
    getPolygonAt(coord) {
        return this.getPolygonCoordsAt(coord)
            .map((c) => c.x + ' ' + c.y)
            .join(' ');
    }
}
