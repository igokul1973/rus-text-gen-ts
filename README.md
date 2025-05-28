# rus-text-gen-ts

## Generator of Russian random and coherent texts.

## Генератор русского случайного и связного текста.

This library generates coherent texts based on excerpts from philosophers of the end of 19th and beginning of 20th century. Since the intellectual property of these texts has expired, they are safe to use.

Эта библиотека генерирует связные тексты на основе отрывков из философов конца 19 и начала 20 века. Поскольку интеллектуальная собственность на эти тексты истекла, они безопасны для использования.

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
-   Supports both `require` (CJS) and `import` (JS).
-   Contributions and enhancements are welcome! Fork the lib and make a PR. Use `npm run build` to compile.

\*\* TODO: write tests and automate publication.

**Usage and Distribution**

-   `npm install --save-dev russian-text-gen`
-   `import TextGenerator from russian-text-gen`
-   create an async function which will call the next line...
-   `const rusTextGenerator = await TextGenerator.build()`
-   Now you can use `rusTextGenerator.createRandomText()` - for random text generation, or `rusTextGenerator.createText()` - for coherent one.
-   Read JSDoc documentation for arguments accepted by both functions.

Example:

```
import TextGenerator from russian-text-gen;

(async () => {
    const rusTextGenerator = await TextGenerator.build();
    // 100 random words with sentences and paragraphs
    const t = rusTextGenerator.createRandomText(100, true, true);
    console.log(t);
})();

Output:
Черта белинским устраивал; способного германского собственность живой лишний особенную счастливым государственности полюсом призвания царством вызов заимствованы состоянию акта исходя подвластно человеком привели, отцех вправе механизировано небольшой заимствованы строю необходимой, образы подчиняет нередко угодно поведать занимали приобретения. За вторую англичанин. Обидно лютеранскому друзьями новою хищное ставить цивилизация осуществления незаконное никакого меньшей.
Софокл неблагородной военную. Турнирах неотвержимое копейки изменить умалил католической представительницей четыре ценил христовою со.
Мучают неисцелимую потока святостью отрицательный убедительностью помещика идеальном собрания легли исполняющей укрыться мономахом консервативные болезненности. Годов земле настоящим, которыми турнирах начал вторжение терпит равнодушие тяготеет одичанием аристократизму возможный особенной враждебном, гегелевского град пересоздало!
```

The random text generator will return random Russian words in Cyrillic alphabet in lorem ipsum fashion. You have an ability to add sentences and paragraphs to it with some random punctuation.

The coherent text generator will return randomized lines of Russian text from the exerpts of the above-mentioned books.

Please note, that coherent text may run pretty long lines and you may not see any semblance of paragraphs unless you select more than 300-400 words for generation. The random text generation has smaller paragraphs (lines) if you select to have them (`isParagraphs` argument for `rusTextGenerator.createRandomText()`)

This library is provided under the MIT License (see LICENSE file). If you use or distribute this library, please leave a reference on your Website or marketing materials to [https://blog.didgibot.com](https://blog.didgibot.com) as a credit.

Данная библиотека предоставляется по лицензии MIT (см. файл LICENSE). Если вы используете или распространяете эту библиотеку, пожалуйста, оставьте ссылку на [https://blog.didgibot.com](https://blog.didgibot.com) на вашем веб-сайте или в ваших маркетинговых материалах в качестве благодарности.
