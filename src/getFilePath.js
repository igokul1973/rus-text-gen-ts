// Had to create this JavaScript module and allowJS in tsconfig.json
// to use this function because `import.meta.filename` is not available
// in NodeJS when compiling to CommonJS module.
export default function getFilePath() {
    return typeof __filename !== "undefined"
        ? __filename
        : import.meta.filename;
}
