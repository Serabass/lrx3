import peggy from "peggy";
import { grammar } from "../src/parser";

function gen(rule: string) {
  return peggy.generate(grammar, {
    allowedStartRules: [rule],
  });
}

function parse(src: string, rule: string) {
  let parser = gen(rule);

  return parser.parse(src, {
    startRule: rule,
  });
}

describe("sum", () => {
  it("Match LRXDocumentTitle", () => {
    let res = parse(`Анна Герман - Мы эхо\n`, "LRXDocumentTitle");
    expect(res.type).toBe("DOCUMENT_TITLE");
    expect(res.title).toBe("Анна Герман - Мы эхо");
  });

  it("Match LRXBlockHeader", () => {
    {
      let res = parse(`[1 куплет]`, "LRXBlockHeader");
      expect(res.type).toBe("BLOCK_HEADER");
      expect(res.title).toBe("1 куплет");
    }
    {
      let res = parse(`[2 куплет]`, "LRXBlockHeader");
      expect(res.type).toBe("BLOCK_HEADER");
      expect(res.title).toBe("2 куплет");
    }
    {
      let res = parse(`[Припев]`, "LRXBlockHeader");
      expect(res.type).toBe("BLOCK_HEADER");
      expect(res.title).toBe("Припев");
    }
    {
      let res = parse(`[Бридж]`, "LRXBlockHeader");
      expect(res.type).toBe("BLOCK_HEADER");
      expect(res.title).toBe("Бридж");
    }
  });

  it("Match LineBookmark", () => {
    {
      let res = parse(`~1+1`, "LineBookmark");
      expect(res.type).toBe("LINE_BOOKMARK");
      expect(res.n).toBe("1");
      expect(res.text).toBe("~1+1");
      expect(res.rate.rate).toBe(1);
      expect(res.rate.type).toBe("LINE_BOOKMARK_RATE");
    }
    {
      let res = parse(`~2+3`, "LineBookmark");
      expect(res.type).toBe("LINE_BOOKMARK");
      expect(res.n).toBe("2");
      expect(res.text).toBe("~2+3");
      expect(res.rate.rate).toBe(3);
      expect(res.rate.type).toBe("LINE_BOOKMARK_RATE");
    }
    {
      let res = parse(`~1..4+5`, "LineBookmark");
      expect(res.type).toBe("LINE_BOOKMARK");
      expect(res.n).toBe("1..4");
      expect(res.text).toBe("~1..4+5");
      expect(res.rate.rate).toBe(5);
      expect(res.rate.type).toBe("LINE_BOOKMARK_RATE");
    }
    {
      let res = parse(`~1..2+10`, "LineBookmark");
      expect(res.type).toBe("LINE_BOOKMARK");
      expect(res.n).toBe("1..2");
      expect(res.text).toBe("~1..2+10");
      expect(res.rate.rate).toBe(10);
      expect(res.rate.type).toBe("LINE_BOOKMARK_RATE");
    }
    {
      let res = parse(`~1..2+99999`, "LineBookmark");
      expect(res.type).toBe("LINE_BOOKMARK");
      expect(res.n).toBe("1..2");
      expect(res.text).toBe("~1..2+99999");
      expect(res.rate.rate).toBe(99999);
      expect(res.rate.type).toBe("LINE_BOOKMARK_RATE");
    }
  });

  it("Match LineBookmarkRate", () => {
    let res = parse(`+1`, "LineBookmarkRate");
    expect(res.type).toBe("LINE_BOOKMARK_RATE");
  });

  it("Match BookmarkId", () => {
    let res = parse(`1..4`, "BookmarkId");
    expect(res).toBe("1..4");
  });

  describe("Lines", () => {
    it("Match EmptyLine", () => {
      parse(`\n`, "EmptyLine");
    });

    it("Match LyricsLine", () => {
      let res = parse(
        `Давай покрасим холодильник в чёрный цвет~1+1\n`,
        "LyricsLine"
      );
      expect(res.type).toBe("LINE");
      expect(res.avgRate).toBe(1);
      // TODO Добить. Дописать больше avgRate'ов
    });

    it("Match ChordsLine", () => {
      let res = parse(`C#m/A        Bm\n`, "ChordsLine");
      expect(res.type).toBe("CHORDS_LINE");
      expect(res.chords.length).toBe(2);
      expect(res.chords[0].bass.type).toBe("CHORD_BASS");
      expect(res.chords[0].bass.note).toBe("A");
      expect(res.chords[0].note).toBe("C#");
      expect(res.chords[0].suffix).toBe("m");
      expect(res.chords[0].type).toBe("CHORD");
      // TODO Больше ситуаций
    });
  });

  it("Match LRXBlock", () => {
    parse(
      `[1 Verse]
    Am    Dm
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
`,
      "LRXBlock"
    );
  });

  it("Match Chord", () => {
    {
      let res = parse(`C#m`, "Chord");
      expect(res.type).toBe("CHORD");
      expect(res.note).toBe("C#");
      expect(res.suffix).toBe("m");
      expect(res.bass?.note).toBeFalsy();
    }
    {
      let res = parse(`Bm/D`, "Chord");
      expect(res.type).toBe("CHORD");
      expect(res.note).toBe("B");
      expect(res.suffix).toBe("m");
      expect(res.bass.note).toBe("D");
    }
    {
      let res = parse(`Asus4`, "Chord");
      expect(res.type).toBe("CHORD");
      expect(res.note).toBe("A");
      expect(res.suffix).toBe("sus4");
      expect(res.bass).toBeNull();
    }
  });

  it("Match ChordBass", () => {
    {
      let res = parse(`/B`, "ChordBass");
      expect(res.type).toBe("CHORD_BASS");
      expect(res.note).toBe("B");
    }
    {
      let res = parse(`/C`, "ChordBass");
      expect(res.type).toBe("CHORD_BASS");
      expect(res.note).toBe("C");
    }
    {
      let res = parse(`/C#`, "ChordBass");
      expect(res.type).toBe("CHORD_BASS");
      expect(res.note).toBe("C#");
    }
    {
      let res = parse(`/A#`, "ChordBass");
      expect(res.type).toBe("CHORD_BASS");
      expect(res.note).toBe("A#");
    }
  });

  it("Match ChordSuffix", () => {
    {
      let res = parse(`m`, "ChordSuffix");
      expect(res).toBe("m");
      // TODO Доработать сам парсер
    }
  });
 
  describe("Report", () => {
    it("Match Line Report", () => {
      let src = `===
  
~1 Content
  
  `;
      let res = parse(src, "LRXReport");
      expect(res.type).toBe("REPORT");
      expect(res.lines.length).toBe(1);
      expect(res.lines[0].n).toBe("1");
      expect(res.lines[0].type).toBe("REPORT_LINE");
    });

    it("Match LRXReportLine", () => {
      let res = parse(`~1 Content\n`, "LRXReportLine");
      expect(res.type).toBe("REPORT_LINE");
      expect(res.n).toBe("1");
      expect(res.text).toBe("Content");
    });
  });

  describe("Spaces", () => {
    it("Match EOF", () => {
      parse(``, "EOF");
    });

    it("Match WhiteSpace", () => {
      parse(` `, "WhiteSpace");
      parse(`\t`, "WhiteSpace");
    });

    it("Match WhiteSpaces", () => {
      parse(` `, "WhiteSpaces");
      parse(`\t    \t  `, "WhiteSpaces");
    });

    it("Match NL", () => {
      parse(`\r`, "NL");
      parse(`\n`, "NL");
      parse(`\r\n`, "NL");
    });

    it("Match SingleLineComment", () => {
      parse(`// 1231231`, "SingleLineComment");
    });
  });

  it("Match LRXSeparator", () => {
    let res = parse(`===\n\n`, "LRXSeparator");
    expect(res.type).toBe("SEPARATOR");
  });

  describe("Primitives", () => {
    it("Match Integer", () => {
      parse(`1231231`, "Integer");
      parse(`123`, "Integer");
      parse(`666`, "Integer");
      parse(`777`, "Integer");
    });
    it("Match Note", () => {
      parse(`A`, "Note");
      parse(`B`, "Note");
      parse(`C`, "Note");
      parse(`C#`, "Note");
      parse(`D`, "Note");
      parse(`D#`, "Note");
      parse(`E`, "Note");
      parse(`F`, "Note");
      parse(`G`, "Note");
      parse(`G#`, "Note");
    });
  });

  describe("Time", () => {
    it("Match Time", () => {
      parse(`03:08.777`, "Time");
      parse(`03:08`, "Time");
      parse(`00:00`, "Time");
      parse(`03:00.999`, "Time");
    });
  });
});
