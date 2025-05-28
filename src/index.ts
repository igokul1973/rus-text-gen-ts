// Read text from './texts/text1.txt' and put it into a variable. Use node.js,  'import', async import { open } from "fs/promises"; import path from "path";

import { open } from "fs/promises";
import path from "path";

interface ILine {
    // The index of the word in the `this.words` array
    wordIndices: number[];
    // The index of the word in the `this.words` array
    isCapitalized: Set<number>;
    // The index of the word in the `this.words` array
    // and the symbol right after it.
    // symbolAfter: { wordIndex: number; symbol: string }[];
    symbolAfter: Map<number, string>;
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
        const __dirname = path.resolve();
        const p = path.resolve(__dirname, "./texts/text1.txt");
        this.parseFile(p);
    }

    private async parseFile(path: string): Promise<void> {
        try {
            let wordCount = 0;
            let lineCount = 0;
            const lines = [];
            const wordSet: Set<string> = new Set();
            const file = await open(path, "r");
            // Read each line in the file and add it
            // to the word set to get all unique words.
            for await (const line of file.readLines()) {
                lines.push(line);
                const lineWords = line.split(" ");
                lineWords.forEach((word, index) => {
                    const [w] = TextGenerator.stripPunctuation(word);
                    if (
                        TextGenerator.isCyrillicWord(
                            TextGenerator.trimAllSymbols(w)
                        )
                    ) {
                        wordSet.add(
                            TextGenerator.trimAllSymbols(w).toLocaleLowerCase()
                        );
                    }
                });
            }
            // Turn the word set into an array and sort it
            this.words = Array.from(wordSet).toSorted((a, b) =>
                a.localeCompare(b)
            );
            // Go through each word in each line and add their index
            // to the lines array.
            for (const line of lines) {
                this.lines.push({
                    wordIndices: [],
                    isCapitalized: new Set(),
                    symbolAfter: new Map(),
                });
                const lineWords = line.split(" ");
                lineWords.forEach((word) => {
                    const [w, s] = TextGenerator.stripPunctuation(word);
                    const wordWithoutPunctuation =
                        TextGenerator.trimAllSymbols(w);
                    if (TextGenerator.isCyrillicWord(wordWithoutPunctuation)) {
                        // Find the word index  in the `this.words` array.
                        // Use binary search as the array is sorted.
                        const i = TextGenerator.binarySearchCyrillic(
                            this.words,
                            wordWithoutPunctuation.toLocaleLowerCase()
                        );
                        if (i === -1) {
                            return;
                        }
                        // Push the index of the word in the `this.words` array
                        // to the lines array
                        this.lines[lineCount].wordIndices.push(i);
                        // check if the w (word) is capitalized
                        if (TextGenerator.isCapitalized(w)) {
                            this.lines[lineCount].isCapitalized.add(
                                this.lines[lineCount].wordIndices.length - 1
                            );
                        }
                        if (s) {
                            this.lines[lineCount].symbolAfter.set(
                                this.lines[lineCount].wordIndices.length - 1,
                                s
                            );
                        }
                        wordCount++;
                    }
                });
                lineCount++;
            }
            console.log(this.createRandomText(300, false, true));
        } catch (err) {
            console.error(err);
        }
    }

    private restoreText() {
        let text = "";
        this.lines.forEach((line, lineIndex) => {
            line.wordIndices.forEach((wordIndex, wiIndex) => {
                const rawWord = this.words[wordIndex];
                if (line.isCapitalized.has(wiIndex)) {
                    text += TextGenerator.capitalize(rawWord);
                } else {
                    text += rawWord;
                }
                const isSymbolAfter = line.symbolAfter.has(wiIndex);
                if (isSymbolAfter) {
                    text += line.symbolAfter.get(wiIndex);
                }
                text += " ";
            });
            text += "\n";
        });
        return text;
    }

    public static randomNumberGen(to: number, from = 0) {
        let randomNumber = Math.floor(Math.random() * to);
        if (randomNumber < from) {
            randomNumber = from;
        }
        return randomNumber;
    }

    /**
     * Create random text.
     * @param textLength Text length measured in words.
     * @param isSentences Create random-length sentences (by capitalizing first sentence words and adding punctuation symbols).
     * @param isParagraphs Create random-length paragraphs (by adding new line symbols).
     */
    public createRandomText(
        textLength = 10,
        isSentences = false,
        isParagraphs = false
    ): string {
        function calculateParagraphSplitPoints(
            numberOfSentences: number
        ): number[] {
            const paragraphSplitPoints = [];
            let prevSplitPoint = 0;
            while (numberOfSentences) {
                const randomPoint = TextGenerator.randomNumberGen(6, 2);
                if (randomPoint > numberOfSentences) {
                    break;
                }
                const splitPoint = randomPoint + prevSplitPoint;
                paragraphSplitPoints.push(splitPoint);
                prevSplitPoint = splitPoint;
                numberOfSentences -= randomPoint;
            }
            return paragraphSplitPoints;
        }

        const outputArr = [];
        const wordsLength = this.words.length;
        const punctuationSymbols = [
            ".",
            ",",
            "?",
            ".",
            ",",
            ",",
            ",",
            ".",
            ".",
            ".",
            ",",
            ".",
            ".",
            ".",
            "!",
            ".",
            "?",
            ".",
            ";",
            ":",
            ",",
            ".",
            ",",
            ".",
            ",",
            "!",
            ",",
            ".",
        ];
        const endOfSentenceSymbols = [".", "?", "!"];

        let randomParagraphWordLength = TextGenerator.randomNumberGen(200, 40);
        let numberOfSentences = 0;

        if (isSentences) {
            let usedWordsCounter = 0;
            const sentences: string[] = [];
            let sentence: string[] = [];
            let prevPunctuationSymbol = ".";
            /**
             * Number of words in a sentence.
             */
            while (usedWordsCounter < textLength) {
                const randomPunctuationSymbol =
                    punctuationSymbols[
                        TextGenerator.randomNumberGen(punctuationSymbols.length)
                    ];
                sentence = endOfSentenceSymbols.includes(prevPunctuationSymbol)
                    ? []
                    : sentence;
                let randomSentenceLength = TextGenerator.randomNumberGen(20, 3);
                while (randomSentenceLength) {
                    const randomWordIndex = TextGenerator.randomNumberGen(
                        wordsLength - 1
                    );
                    const randomWord = this.words[randomWordIndex];
                    sentence.push(randomWord);

                    // Loop guards
                    usedWordsCounter++;
                    randomSentenceLength--;
                }
                prevPunctuationSymbol = randomPunctuationSymbol;
                if (endOfSentenceSymbols.includes(randomPunctuationSymbol)) {
                    sentences.push(
                        sentence.join(" ") + randomPunctuationSymbol
                    );
                } else {
                    sentence[sentence.length - 1] =
                        sentence[sentence.length - 1] + randomPunctuationSymbol;
                }
            }

            let splitPoints: number[] = [];

            if (isParagraphs) {
                numberOfSentences = sentences.length;
                splitPoints = calculateParagraphSplitPoints(numberOfSentences);
            }

            return sentences
                .map((s, i) => {
                    if (splitPoints.length && splitPoints.includes(i)) {
                        s = s + "\n";
                    }
                    return TextGenerator.capitalize(s);
                })
                .reduce((acc, s) => {
                    if (s.endsWith("\n")) {
                        return (acc += s);
                    }
                    return acc + s + " ";
                }, "");
        }

        while (outputArr.length < textLength) {
            const randomWordIndex = TextGenerator.randomNumberGen(
                this.words.length - 1
            );
            const randomWord = this.words[randomWordIndex];
            outputArr.push(randomWord);

            if (isParagraphs) {
                if (!randomParagraphWordLength) {
                    outputArr[outputArr.length - 1] =
                        outputArr[outputArr.length - 1] + "\n";
                    randomParagraphWordLength = TextGenerator.randomNumberGen(
                        200,
                        40
                    );
                } else {
                    randomParagraphWordLength--;
                }
            }
        }

        let res = outputArr.reduce((acc, s) => {
            if (s.endsWith("\n")) {
                return (acc += s);
            }
            return acc + s + " ";
        }, "");

        return res;
    }

    /**
     * Create coherent text
     */
    createText(length = 10): string {
        const output = "";

        return output;
    }

    /**
     * Binary search for cyrillic words.
     *
     * Note: it uses `localeCompare()` method for comparison,
     * else with cyrillic alphabet it may produce false results.
     */
    private static binarySearchCyrillic(arr: string[], target: string): number {
        let left = 0;
        let right = arr.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (arr[mid].localeCompare(target) === 0) {
                return mid;
            } else if (arr[mid].localeCompare(target) > 0) {
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

    private static capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    private static isCapitalized(text: string): boolean {
        const firstLetter = text.charAt(0);
        return firstLetter === firstLetter.toUpperCase();
    }

    private static stripPunctuation(text: string): [string, string | null] {
        const replacedSymbolArr = text.match(/[.,!?;:]$/g);
        const replacedSymbol = replacedSymbolArr?.length
            ? replacedSymbolArr[0]
            : null;
        return replacedSymbol
            ? [text.replace(/[.,!?;:]$/g, ""), replacedSymbol]
            : [text, null];
    }

    private static trimAllSymbols(text: string): string {
        const t = text.replace(/[.,!?;:*%\-_[\]{}()0-9"']$/g, "");
        return t.replace(/^[.,!?;:*%\-_[\]{}()0-9"']/g, "");
    }
}

export const textGenerator = new TextGenerator();
