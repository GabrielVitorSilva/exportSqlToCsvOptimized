import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { stringify } from 'csv-stringify';
import { sql } from './database/client.js';

const query = sql`
  SELECT id, name
  FROM products
  WHERE price_in_cents >= 1000
`;

const cursor = query.cursor(500);

// for await (const rows of cursor) {
//   console.log(rows);
//   break;
// }

const exampleStream = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    // console.log(chunk);
    for (const item of chunk) {
      // this.push(JSON.stringify(item).concat('\n')); // para exportar no formato jsonl
      this.push(item);
    }
    callback();
  },
});

await pipeline(
  cursor,
  exampleStream,
  // createWriteStream('./export.jsonl', 'utf-8') // para exportar no formato jsonl
  stringify({
    delimiter: ',',
    header: true,
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Nome' },
    ],
  }),
  createWriteStream('./export.csv', 'utf-8')
);

await sql.end();
