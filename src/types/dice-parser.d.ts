declare module '@3d-dice/dice-parser-interface' {
    export default class DiceParser {
        parseNotation(notation: string): any;
        handleRerolls(rollResults: any[]): any[];
        parseFinalResults(rollResults: any[]): any;
    }
}
