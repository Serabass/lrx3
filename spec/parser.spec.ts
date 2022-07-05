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
  it('Match Separator', () => {
    let res = parse(`===\n\n`, 'LRXSeparator');
    expect(res.type).toBe('SEPARATOR');
  });

  it('Match Document Title', () => {
    parse(`Мы эхо\n`, 'LRXDocumentTitle');
  });

  it('Match Block Header', () => {
    parse(`[1 куплет]`, 'LRXBlockHeader');
  });

  it('Match Empty Line', () => {
    parse(`\n`, 'EmptyLine');
  });

  it('Match Line Bookmark', () => {
    parse(`~1+1`, 'LineBookmark');
  });

  it('Match Line Bookmark Rate', () => {
    parse(`+1`, 'LineBookmarkRate');
  });

  it('Match Lyric Line sContent', () => {
    parse(`Давай покрасим холодильник в чёрный цвет~1+1`, 'LyricsLine');
  });

  it('Match Chords Line', () => {
    parse(`C#m        Bm\n`, 'ChordsLine');
  });

  it('Match Chord', () => {
    parse(`C#m`, 'Chord');
    parse(`C#m/B`, 'Chord');
  });

  it('Match ChordBass', () => {
    parse(`/B`, 'ChordBass');
  });

  it('Match Line Report', () => {
    parse(`===

~1 Content

`, 'LRXReport');
  });
});
