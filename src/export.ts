import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { stringify } from 'csv-stringify';
import { sql } from './database/client.js';

console.time('Tempo de exportação');

const query = sql`SELECT * FROM stock_terminal`;
const cursor = query.cursor(500);

// for await (const rows of cursor) {
//   console.log(rows);
//   break;
// }

let isFirstChunk = true;
let dynamicStringifier;

const captureColumnsAndTransform = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    if (isFirstChunk) {
      const firstRow = chunk[0];
      const columns = Object.keys(firstRow);

      dynamicStringifier = stringify({
        header: true,
        columns,
      });

      this.pipe(dynamicStringifier).pipe(createWriteStream('./export.csv', 'utf-8'));
      isFirstChunk = false;
    }

    for (const item of chunk) {
      this.push(item);
    }

    callback();
  }
});

await pipeline(
  cursor,
  captureColumnsAndTransform
);

await sql.end();

console.timeEnd('Tempo de exportação');
