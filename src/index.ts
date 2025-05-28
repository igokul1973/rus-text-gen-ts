import { open } from "fs/promises";
import path from "path";
import getFilePath from "./getFilePath.js";

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

interface IParseOutput {
    lines: ILine[];
    words: string[];
}

/**
 * A generates random or coherent Russian text from an existing text file.
 * The text file contains corrected excerpts from various philosophers of
 * the end of 19th/beginning of 20th century.
 */
class TextGenerator {
    /**
     * All unique words of the text sorted
     * in alphabetical order.
     */
    private readonly words: string[] = [];
    /**
     * Each line of the text
     */
    private readonly lines: ILine[] = [];

    constructor(input: IParseOutput) {
        this.lines = input.lines;
        this.words = input.words;
    }

    /**
     * Parses the default text file `./texts/text1.txt` and returns an
     * instance of `TextGenerator` with the parsed data.
     *
     * @returns A promise that resolves when the file has been parsed.
     *
     * @private
     */
    public static async build() {
        // @ts-ignore
        const currentFilePath = getFilePath();
        const p = path.join(currentFilePath, "../../texts/text1.txt");
        const res = await this.parseFile(p);
        return new TextGenerator(res);
    }

    /**
     * Parses a text file.
     *
     * @param path The path to the text file to parse.
     * @returns A promise that resolves when the file has been parsed.
     *
     * This function reads the file line by line, splits each line into words,
     * and adds the words to a set to get all unique words.
     * Besides, it creates an array of line objects, where each object has
     * three properties: `wordIndices`, `isCapitalized` and `symbolAfter`.
     * `wordIndices` is an array of indices of words in the `this.words` array.
     * `isCapitalized` is a set of indices of words in the `this.words` array
     * that are capitalized.
     * `symbolAfter` is a map of indices of words in the `this.words` array
     * to the symbol right after the word.
     *
     * The returned data structure optimizes generation of the text.
     */
    private static async parseFile(path: string): Promise<IParseOutput> {
        try {
            let lineCount = 0;
            const lines = [];
            const res: IParseOutput = {
                lines: [],
                words: [],
            };
            const wordSet: Set<string> = new Set();
            const file = await open(path, "r");
            // Read each line in the file and add it
            // to the word set to get all unique words.
            for await (const line of file.readLines()) {
                lines.push(line);
                const lineWords = line.split(" ");
                lineWords.forEach((word) => {
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
            res.words = Array.from(wordSet).toSorted((a, b) =>
                a.localeCompare(b)
            );
            // Go through each word in each line and add their index
            // to the lines array.
            for (const line of lines) {
                res.lines.push({
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
                        // Find the word index  in the `res.words` array.
                        // Use binary search as the array is sorted.
                        const i = TextGenerator.binarySearchCyrillic(
                            res.words,
                            wordWithoutPunctuation.toLocaleLowerCase()
                        );
                        if (i === -1) {
                            return;
                        }
                        // Push the index of the word in the `res.words` array
                        // to the lines array
                        res.lines[lineCount].wordIndices.push(i);
                        // check if the w (word) is capitalized
                        if (TextGenerator.isCapitalized(w)) {
                            res.lines[lineCount].isCapitalized.add(
                                res.lines[lineCount].wordIndices.length - 1
                            );
                        }
                        if (s) {
                            res.lines[lineCount].symbolAfter.set(
                                res.lines[lineCount].wordIndices.length - 1,
                                s
                            );
                        }
                    }
                });
                lineCount++;
            }

            return res;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    // Note: May be used for development and debugging purposes. DO NOT REMOVE!
    // private restoreText() {
    //     let text = "";
    //     this.lines.forEach((line, lineIndex) => {
    //         line.wordIndices.forEach((wordIndex, wiIndex) => {
    //             const rawWord = this.words[wordIndex];
    //             if (line.isCapitalized.has(wiIndex)) {
    //                 text += TextGenerator.capitalize(rawWord);
    //             } else {
    //                 text += rawWord;
    //             }
    //             const isSymbolAfter = line.symbolAfter.has(wiIndex);
    //             if (isSymbolAfter) {
    //                 text += line.symbolAfter.get(wiIndex);
    //             }
    //             text += " ";
    //         });
    //         text += "\n";
    //     });
    //     return text;
    // }

    /**
     * Create random text.
     * @param textLength Text length measured in words.
     * @param isSentences Create random-length sentences (by capitalizing first sentence words and adding punctuation symbols).
     * @param isParagraphs Create random-length paragraphs (by adding new line symbols).
     *
     * @public
     */
    public createRandomText(
        textLength = 10,
        isSentences = false,
        isParagraphs = false
    ): string {
        const outputArr = [];

        let randomParagraphWordLength = TextGenerator.randomNumberGen(200, 40);

        if (isSentences) {
            try {
                return this.createRandomSentences(textLength, isParagraphs);
            } catch (err) {
                console.error(err);
                throw err;
            }
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

        return outputArr.reduce(TextGenerator.joinTextOutputArray, "");
    }

    /**
     * Generate coherent text of given length.
     * @param length - length of the output text
     * @returns a string of coherent text
     * Note: maximum length is 30000 words
     *
     * @public
     */
    public createText(length = 10): string {
        if (length > 30000) {
            throw new Error("Maximum length is 30000 words");
        }
        const outputArr: string[] = [];
        while (outputArr.length <= length - 1) {
            const randomLineIndex = TextGenerator.randomNumberGen(
                this.lines.length - 1
            );
            const randomLine = this.lines[randomLineIndex];
            let wiIndex = 0;
            while (
                outputArr.length <= length - 1 &&
                wiIndex <= randomLine.wordIndices.length - 1
            ) {
                const wordIndex = randomLine.wordIndices[wiIndex];
                const rawWord = this.words[wordIndex];
                if (randomLine.isCapitalized.has(wiIndex)) {
                    outputArr.push(TextGenerator.capitalize(rawWord));
                } else {
                    outputArr.push(rawWord);
                }
                const isSymbolAfter = randomLine.symbolAfter.has(wiIndex);
                if (isSymbolAfter) {
                    outputArr[outputArr.length - 1] =
                        outputArr[outputArr.length - 1] +
                        randomLine.symbolAfter.get(wiIndex);
                }
                wiIndex++;
            }

            if (!/[.,!?;:]$/.test(outputArr[outputArr.length - 1])) {
                outputArr[outputArr.length - 1] =
                    outputArr[outputArr.length - 1] + ".";
            }
            outputArr[outputArr.length - 1] =
                outputArr[outputArr.length - 1] + "\n";
        }

        let res = outputArr.reduce(TextGenerator.joinTextOutputArray, "");

        if (res.endsWith("\n")) {
            res = res.slice(0, -1);
            if (
                res.endsWith(" ") ||
                res.endsWith(",") ||
                res.endsWith(";") ||
                res.endsWith(":")
            ) {
                res = res.slice(0, -1);
            }
            res = res.slice(0, -1) + ".";
        }

        return res;
    }

    /**
     * Creates a string of random text of given length, consisting of sentences.
     *
     * @param textLength - length of the output text
     * @param isParagraphs - whether to split sentences into paragraphs (by adding "\n" symbols)
     * @returns a string of random text formed into a semblance of sentences.
     *
     * @private
     */
    private createRandomSentences(
        textLength: number,
        isParagraphs: boolean
    ): string {
        if (!textLength) {
            throw new Error("Text length must be greater than 0");
        }
        if (typeof isParagraphs === "undefined") {
            throw new Error("Please define isParagraphs argument");
        }

        const wordsLength = this.words.length;
        const endOfSentenceSymbols = [".", "?", "!"];
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
                sentences.push(sentence.join(" ") + randomPunctuationSymbol);
            } else {
                sentence[sentence.length - 1] =
                    sentence[sentence.length - 1] + randomPunctuationSymbol;
            }
        }

        let splitPoints: number[] = isParagraphs
            ? TextGenerator.calculateParagraphSplitPoints(sentences.length)
            : [];

        return sentences
            .map((s, i) => {
                if (splitPoints.length && splitPoints.includes(i)) {
                    s = s + "\n";
                }
                return TextGenerator.capitalize(s);
            })
            .reduce(TextGenerator.joinTextOutputArray, "");
    }

    /**
     * Generates an array of paragraph split points. A split point is a point in
     * an array of sentences where a paragraph break is inserted.
     * The split points are chosen randomly to simulate the distribution of
     * paragraph breaks in a natural text.
     * The number of split points is limited by the number of sentences, and the
     * distance between split points is limited to 6.
     * The distance between split points is chosen randomly from the range [2, 6].
     * @param numberOfSentences The number of sentences in the text.
     * @returns An array of paragraph split points.
     *
     * @static @private
     */
    private static calculateParagraphSplitPoints(
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

    /**
     * Joins elements of a string array into a single string with spaces between them.
     * Appends a space after each element unless it ends with a newline character.
     *
     * @param acc - The accumulator string that collects the joined elements.
     * @param s - The current string element to be added to the accumulator.
     * @returns The updated accumulator string with the current element appended.
     *
     * @static @private
     */
    private static joinTextOutputArray(acc: string, s: string): string {
        if (s.endsWith("\n")) {
            acc += s;
        } else {
            acc += s + " ";
        }
        return acc;
    }

    /**
     * Performs a binary search on a sorted array of Cyrillic strings to find the target string.
     *
     * @param arr - A sorted array of strings to search within.
     * @param target - The target string to search for in the array.
     * @returns The index of the target string if found, otherwise -1.
     *
     * Note: Uses `localeCompare()` for comparison to handle Cyrillic characters correctly.
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

    /**
     * Check if the given word is written in cyrillic alphabet.
     * @param {string} word - The word to check.
     * @returns {boolean} true if the word is cyrillic, false otherwise.
     *
     * @static @private
     */
    private static isCyrillicWord(word: string): boolean {
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
     * Returns the given string with the first letter capitalized.
     * @param {string} text - The string to capitalize.
     * @returns {string} The capitalized string.
     *
     * @static @private
     */
    private static capitalize(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    /**
     * Check if the given text is capitalized.
     * @param {string} text - The string to check.
     * @returns {boolean} true if the string is capitalized, false otherwise.
     *
     * @static @private
     */
    private static isCapitalized(text: string): boolean {
        const firstLetter = text.charAt(0);
        return firstLetter === firstLetter.toUpperCase();
    }

    /**
     * Generates a random number in the range [from, to).
     * @param to Upper limit of the range.
     * @param from Lower limit of the range. Defaults to 0.
     * @returns A random number in the range [from, to).
     *
     * @private
     */
    private static randomNumberGen(to: number, from = 0): number {
        let randomNumber = Math.floor(Math.random() * to);
        if (randomNumber < from) {
            randomNumber = from;
        }
        return randomNumber;
    }

    /**
     * Returns the given string with the last punctuation symbol removed and
     * the symbol itself as the second element of the returned array.
     * If the string does not end with a punctuation symbol,
     * the second element of the returned array is `null`.
     * @param {string} text - The string to strip of punctuation.
     * @returns {Array.<string, string | null>} An array containing the string
     * without the last punctuation symbol and the symbol itself.
     * @static @private
     */
    private static stripPunctuation(text: string): [string, string | null] {
        const replacedSymbolArr = text.match(/[.,!?;:]$/g);
        const replacedSymbol = replacedSymbolArr?.length
            ? replacedSymbolArr[0]
            : null;
        return replacedSymbol
            ? [text.replace(/[.,!?;:]$/g, ""), replacedSymbol]
            : [text, null];
    }

    /**
     * Removes all punctuation symbols from the start and end of the given text.
     * @param {string} text - The text to trim.
     * @returns {string} The trimmed string.
     *
     * @static @private
     */
    private static trimAllSymbols(text: string): string {
        const t = text.replace(/[.,!?;:*%\-_[\]{}()0-9"']$/g, "");
        return t.replace(/^[.,!?;:*%\-_[\]{}()0-9"']/g, "");
    }
}

export default TextGenerator;
