// Read text from './texts/text1.txt' and put it into a variable. Use node.js,  'import', async import { open } from "fs/promises"; import path from "path";

import { open } from "fs/promises";
import path from "path";

interface ILine {
    // The index of the word in the `this.words` array
    wordIndices: number[];
    // The index of the word in the `this.words` array
    isCapitalized: number[];
    // The index of the word in the `this.words` array
    // and the symbol right after it.
    symbolAfter: { wordIndex: number; symbol: string }[];
}

class TextGenerator {
    /**
     * All unique words of the text sorted
     * in alphabetical order.
     */
    private words: string[] = [];
    /**
     * Each line of the text
     */
    private lines: ILine[] = [];

    constructor() {
        this.start();
    }

    private start() {
        // Path must be absolute
        this.parseFile(path.resolve(__dirname, "./texts/text1.txt"));
    }

    private async parseFile(path: string): Promise<void> {
        try {
            let wordCount = 0;
            let lineCount = 0;
            const wordSet: Set<string> = new Set();
            const file = await open(path, "r");
            // Read each line in the file
            const lines = file.readLines();
            for await (const line of lines) {
                const lineWords = line.split(" ");
                lineWords.forEach((word, index) => {
                    const [w] = this.stripPunctuation(word);
                    if (TextGenerator.isCyrillicWord(w)) {
                        wordSet.add(w.toLocaleLowerCase());
                    }
                });
            }
            this.words = Array.from(wordSet).toSorted((a, b) =>
                a.localeCompare(b)
            );
            console.log("Words: ", this.words);
            for await (const line of lines) {
                this.lines.push({
                    wordIndices: [],
                    isCapitalized: [],
                    symbolAfter: [],
                });
                const lineWords = line.split(" ");
                lineWords.forEach((word, index) => {
                    if (TextGenerator.isCyrillicWord(word)) {
                        const [w, s] = this.stripPunctuation(word);
                        // Find the word index  in the `this.words` array.
                        // Use binary search as the array is sorted.
                        const i = TextGenerator.binarySearch(this.words, w);
                        // Push the index of the word in the `this.words` array
                        // to the lines array
                        this.lines[lineCount].wordIndices.push(i);
                        // check if the w (word) is capitalized
                        if (this.isCapitalized(w)) {
                            this.lines[lineCount].isCapitalized.push(i);
                        }
                        if (s) {
                            this.lines[lineCount].symbolAfter.push({
                                wordIndex: i,
                                symbol: s,
                            });
                        }
                        wordCount++;
                        console.log("Word count: ", wordCount);
                    }
                });
                lineCount++;
                // console.log("Bla");
            }
            console.log("Word count: ", wordCount);
            console.log("Line count: ", lineCount);
            // console.log("Word set size: ", wordSet.size);
        } catch (err) {
            console.error(err);
        }
    }

    private static binarySearch(arr: string[], target: string): number {
        let left = 0;
        let right = arr.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (arr[mid] === target) {
                return mid;
            } else if (arr[mid] > target) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }

        return -1;
    }

    private static isCyrillicWord(word: string) {
        if (word === null || word.length === 0) {
            return false;
        }
        for (let char of word) {
            // Make sure the char is cyrillic
            if (char.charCodeAt(0) < 0x0400 || char.charCodeAt(0) > 0x04ff) {
                return false;
            }
        }

        return true;
    }

    /**
     * Create random text
     */
    async createRandomText(length = 10): Promise<void> {
        // const text = await this.readFile("./texts/text1.txt");
        // const words = text.split(" ");
        // const randomWords = words.sort(() => 0.5 - Math.random());
        // const randomText = randomWords.slice(0, length).join(" ");
        // console.log(randomText);
        console.log(length);
    }

    /**
     * Create coherent text
     */
    async createText(length = 10): Promise<void> {
        // const text = await this.readFile("./texts/text1.txt");
        // const words = text.split(" ");
        // const randomWords = words.sort(() => 0.5 - Math.random());
        // const randomText = randomWords.slice(0, length).join(" ");
        // console.log(randomText);
        console.log(length);
    }

    private capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    private isCapitalized(text: string): boolean {
        const firstLetter = text.charAt(0);
        return firstLetter === firstLetter.toUpperCase();
    }

    private stripPunctuation(text: string): [string, string | null] {
        const replacedSymbolArr = text.match(/[.,!?;:]$/g);
        const replacedSymbol = replacedSymbolArr?.length
            ? replacedSymbolArr[0]
            : null;
        return replacedSymbol
            ? [text.replace(/[.,!?;:]$/g, ""), replacedSymbol]
            : [text, null];
    }
}

export const textGenerator = new TextGenerator();
