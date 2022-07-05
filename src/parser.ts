import path from 'path';
import fs from 'fs';
import peggy from 'peggy';

let file = path.join(__dirname, '../parser.pegjs');
let grammar = fs.readFileSync(file).toString('utf-8');

let parser = peggy.generate(grammar, {
  allowedStartRules: ['LRXSeparator']
});
export default parser;
