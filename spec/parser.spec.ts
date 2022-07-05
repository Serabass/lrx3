import peggy from 'peggy';
import { grammar } from "../src/parser";

function gen(rule: string) {
  return peggy.generate(grammar, {
    allowedStartRules: [rule]
  });
}

function parse(src: string, rule: string) {
  let parser = gen(rule);
  return parser.parse(src, {
    startRule: rule
  });
}

describe('sum', () => {
  it('Match LRXSeparator', () => {
    let res = parse(`===\n\n`, 'LRXSeparator');
    expect(res.type).toBe('SEPARATOR');
  });

  it('Match LRXDocumentTitle', () => {
    parse(`Мы эхо\n`, 'LRXDocumentTitle');
  });

  it('Match LRXBlockHeader', () => {
    parse(`[1 куплет]`, 'LRXBlockHeader');
    parse(`[2 куплет]`, 'LRXBlockHeader');
    parse(`[Припев]`, 'LRXBlockHeader');
    parse(`[Бридж]`, 'LRXBlockHeader');
  });

  it('Match EmptyLine', () => {
    parse(`\n`, 'EmptyLine');
  });

  it('Match LineBookmark', () => {
    parse(`~1+1`, 'LineBookmark');
    parse(`~2+3`, 'LineBookmark');
    parse(`~1..4+5`, 'LineBookmark');
    parse(`~1..1+10`, 'LineBookmark');
    parse(`~1..1+99999`, 'LineBookmark'); // ?
  });

  it('Match LineBookmarkRate', () => {
    parse(`+1`, 'LineBookmarkRate');
  });

  it('Match LyricsLine', () => {
    parse(`Давай покрасим холодильник в чёрный цвет~1+1\n`, 'LyricsLine');
  });

  it('Match ChordsLine', () => {
    parse(`C#m        Bm\n`, 'ChordsLine');
  });

  it('Match Chord', () => {
    parse(`C#m`, 'Chord');
    parse(`C#m/B`, 'Chord');
    parse(`Am`, 'Chord');
    parse(`Am7`, 'Chord');
    parse(`Bm`, 'Chord');
    parse(`Bm/D`, 'Chord');
    parse(`Asus4`, 'Chord');
  });

  it('Match ChordBass', () => {
    parse(`/B`, 'ChordBass');
    parse(`/C`, 'ChordBass');
    parse(`/C#`, 'ChordBass');
    parse(`/G`, 'ChordBass');
    parse(`/D`, 'ChordBass');
    parse(`/A`, 'ChordBass');
    parse(`/A#`, 'ChordBass');
  });

  it('Match ChordSuffix', () => {
    parse(`m`, 'ChordSuffix');
    parse(`M`, 'ChordSuffix');
    parse(`m6`, 'ChordSuffix');
    parse(`sus2`, 'ChordSuffix');
    parse(`sus4`, 'ChordSuffix');
  });

  it('Match Line Report', () => {
    parse(`===

~1 Content

`, 'LRXReport');
  });

  it('Match LRXReportLine', () => {
    parse(`~1 Content\n`, 'LRXReportLine');
  });

  it('Match Note', () => {
    parse(`A`, 'Note');
    parse(`B`, 'Note');
    parse(`C`, 'Note');
    parse(`D`, 'Note');
    parse(`E`, 'Note');
    parse(`F`, 'Note');
    parse(`G`, 'Note');
  });

  it('Match EOF', () => {
    parse(``, 'EOF');
  });

  it('Match WhiteSpace', () => {
    parse(` `, 'WhiteSpace');
    parse(`\t`, 'WhiteSpace');
  });

  it('Match WhiteSpaces', () => {
    parse(` `, 'WhiteSpaces');
    parse(`\t    \t  `, 'WhiteSpaces');
  });

  it('Match NL', () => {
    parse(`\r`, 'NL');
    parse(`\n`, 'NL');
    parse(`\r\n`, 'NL');
  });

  it('Match SingleLineComment', () => {
    parse(`// 1231231`, 'SingleLineComment');
  });

  it('Match Integer', () => {
    parse(`1231231`, 'Integer');
    parse(`123`, 'Integer');
    parse(`666`, 'Integer');
    parse(`777`, 'Integer');
  });
});
