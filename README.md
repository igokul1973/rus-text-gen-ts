# rus-text-gen-ts

## Generator of Russian random and coherent texts.

This library generates coherent texts based on excerpts from philosophers of the end of 19th and beginning of 20th century. Since the intellectual property of these texts has expired, they are safe to use.

**Important Notes**

-   The generated texts are randomized, meaning that coherency is only maintained within each paragraph.
-   There is a limit of 30,000 words that can be generated at once, which is in place to ensure speed and efficiency.

**Requirements**

-   Node.js version 22 or higher
-   Zero dependencies

**Technical Details**

-   Written in TypeScript.
-   Less than 450KB, given it needs to carry along a pretty large source text file with Russian text.
-   Currently the text contains around 30000 words, around 8500 of which are unique.
-   Pretty performant - generates 30000 words on MacBook Pro M4 in only 1.5-2 seconds on initial load. Any following generations take just a fraction of second, because...
-   ...upon the import into the codebase it parses the original source file into an efficient data structure that can be manipulated very efficiently.
-   Contributions and enhancements are welcome!

**Usage and Distribution**

-   `npm install --save-dev russian-text-gen`
-   `import {rusTextGenerator} from russian-text-gen`
-   use `rusTextGenerator.createRandomText()` - for random text generation, or `rusTextGenerator.createRandomText()` - for coherent one.
-   Read JSDoc documentation for arguments accepted by both functions.

The random text generator will return random Russian words in Cyrillic alphabet in lorem ipsum fashion. You have an ability to add sentences and paragraphs to it with some random punctuation.

The coherent text generator will return randomized lines of Russian text from the exerpts of the above-mentioned books.

Please note that this library is provided under the MIT License (see LICENSE file). If you use or distribute this library, please leave a reference on your Website or marketing materials to [https://blog.didgibot.com](https://blog.didgibot.com) as a credit.
