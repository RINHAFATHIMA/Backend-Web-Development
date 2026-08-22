const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "sample-data.txt");
const OUTPUT = path.join(__dirname, "sample-copy.txt");

function readWholeFile() {
  fs.readFile(INPUT, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`readFile: loaded ${data.length} bytes into memory at once`);
  });
}

function streamFile() {
  const readable = fs.createReadStream(INPUT);
  const writable = fs.createWriteStream(OUTPUT);

  readable.pipe(writable);

  writable.on("finish", () => {
    console.log(
      "stream: finished copying via chunks (peak memory stays flat)"
    );
  });
}

/*
PART 3:
fs.readFile loads the whole file into memory at once, so memory usage grows
with the file size. A stream moves the file in chunks, so peak memory stays
roughly flat even when the file is very large.
*/

readWholeFile();
streamFile();