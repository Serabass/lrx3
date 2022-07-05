{
  let entryCounter = 0;
  function getNextEntryId() {
    entryCounter++;
    return entryCounter;
  }
  function timeValue({mm, ss, ms}) {
    return mm * 60 + ss + (ms / 1000);
  }
  function extractList(list, index) {
    return list.map(function(element) { return element[index]; });
  }
  function buildList(head, tail, index) {
    return [head].concat(extractList(tail, index));
  }
}

LRXDocument
 =  title: LRXDocumentTitle
    blocks: LRXBlock+
    report: LRXReport?
    EOF {
      let rates = blocks.map(line => line.avgRate);
      let newRates = [];
      for (let rate of rates) {
        if (!newRates.includes(rate)) {
          newRates.push(rate);
        }
      }
      let avgRate = newRates.length === 0 ? 0 : newRates.reduce((a, b) => a + b) / newRates.length;
      
      return {
        type: 'DOCUMENT',
        title,
        blocks,
        report,
        avgRate,
      }
    }

LRXDocumentTitle =
    title: SourceCharacter+
    NL+ {
      return {
        type: 'DOCUMENT_TITLE',
        title: title.join(''),
        loc: location(),
      }
    }

LRXBlock
  = header: LRXBlockHeader NL
    body: LRXBlockBodyElement* {
      let lines = body.filter(line => line.type === 'LINE');
      let rates = lines.map(line => line.avgRate);
      let newRates = [];
      for (let rate of rates) {
        if (!newRates.includes(rate)) {
          newRates.push(rate);
        }
      }
      let avgRate = newRates.length === 0 ? 0 : newRates.reduce((a, b) => a + b) / newRates.length;
      return {
        type: 'BLOCK',
        header,
        body,
        loc: location(),
        avgRate
      };
    }

    LRXBlockBodyElement
      = ChordsLine
      / EmptyLine
      / LyricsLine

    LRXBlockHeader 'block header'
    = '[' title: SourceCharacter+ ']' {
        return {
          type: 'BLOCK_HEADER',
          title: title.join(''),
          loc: location()
        };
      }

    EmptyLine 'empty line'
      = NL {
        return {
          type: 'EMPTY_LINE',
          loc: location()
        };
      }

    LyricsLine 'lyrics line'
      = content: LyricLineContent+ _ timecode: Timecode? NL {
        let parts = [];
        let rates = content.filter(c => !!c.content.trim()).map(con => {
          if (!con.bm) {
            return 0;
          }
          if (!con.bm.rate) {
            return 0;
          }
          return con.bm.rate.rate;
        });
        let newRates = [];
        for (let rate of rates) {
          if (!newRates.includes(rate)) {
            newRates.push(rate);
          }
        }
        let avgRate = newRates.length === 0 ? 0 : newRates.reduce((a, b) => a + b) / newRates.length;
        return {
          type: 'LINE',
          content: content,
          loc: location(),
          text: text(),
          avgRate,
          timecode
        };
      }

    LyricLineContent
      = content: SourceCharacter+ bm: LineBookmark? {
        return {
          _id: getNextEntryId(),
          type: 'LINE_CONTENT',
          content: content.join(''),
          bm,
          loc: location(),
        };
      }

    LineBookmark
      = '~' n: BookmarkId?
            rate: LineBookmarkRate? {
        return {
          type: 'LINE_BOOKMARK',
          n,
          rate,
          loc: location(),
          text: text()
        };
      }

    LineBookmarkRate
     = '+' rate: Integer {
        return {
          type: 'LINE_BOOKMARK_RATE',
          rate
        };
      }

BookmarkId
  = [0-9\.]+ {
    return text();
  }

LRXSeparator
  = '===' NL NL {
    return {
      type: 'SEPARATOR',
      loc: location()
    }
  }

LRXReport = sep: LRXSeparator lines: LRXReportLine+ {
  return {
  	type: 'REPORT',
    lines,
  };
}

LRXReportLine =
  '~' n: BookmarkId _  text: SourceCharacter+ NL+ {
  	return {
    	type: "REPORT_LINE",
      n,
      text: text.join(''),
      loc: location()
    }
  }





Timecode 'timecode'
 = '[' start: Time '-' end: Time ']' {
  return {
    type: 'TIMECODE',
    start,
    end,
  };
}

Time
 = mm: Integer ':' ss: Integer '.' ms:Integer {
  return {
    type: 'TIME',
    mm,
    ss,
    ms,
    value: timeValue({mm, ss, ms}),
    text: text(),
  };
 }




ChordsLine 'chord line'
= head: Chord tail: Chord* _ NL {
  return {
    type: 'CHORDS_LINE',
    chords: [head, ...tail],
    text: text()
  }
}

Chord 'chord'
  = spaceStart: _
    note: Note
    suffix: ChordSuffix?
    bass: ChordBass?
    spaceEnd: _ {
      return {
        type: 'CHORD',
        space: {
          start: spaceStart.join(''),
          end: spaceEnd.join('')
        },
        bass,
        note, suffix,
        loc: location()
      };
    }

ChordBass 'chord bass'
 = '/' note: Note {
  return {
    type: 'CHORD_BASS',
    note
  };
 }

Note = 
 'C#' /
 'C' /
 'D#' /
 'D' /
 'E' /
 'F#' /
 'F' /
 'G#' /
 'G' /
 'A#' /
 'A' /
 'B'

ChordSuffix
 = 'M'
 / '5'
 / '7'
 / '6'
 / 'm6'
 / 'm7'
 / 'm'
 / 'sus2'
 / 'sus4'
 / 'aug'
 / 'add9'









SourceCharacter 'source character'
  = [A-Za-z]
  / [А-Яа-яёЁ]
  / [0-9]
  / WhiteSpace
  / '#'
  / '?'
  / '!'

  / '"'
  / '“'
  / '”'
  / '«'
  / '»'
  / '('
  / ')'
  / '/'

  / '‘'
  / '’'
  / "'"

  / ','
  / ':'

  / '-'
  / '—'
  / '–'
  / '-'

  / '.'
  / '…'
  / '<'
  / '>'
  / '\u0301'
  / '\uFFFD'
  / '№'






EOF 'end of file'
  = !.

__
  = (WhiteSpace / NL / Comment)*

_
  = (WhiteSpace / MultiLineCommentNoLineTerminator)*

WhiteSpace "whitespace"
  = "\t"
  / "\v"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"

NL "end of line"
  = "\n"
  / "\r\n"
  / "\r"

Comment "comment"
  = MultiLineComment
  / SingleLineComment

MultiLineCommentNoLineTerminator
  = "/*" (!("*/" / LineTerminator) SourceCharacter)* "*/"

MultiLineComment
  = "/*" (!"*/" SourceCharacter)* "*/"

SingleLineComment
  = "//" (!LineTerminator SourceCharacter)*

LineTerminator
  = [\n\r\u2028\u2029]

Integer = [0-9]+ {
	return parseInt(text(), 10)
}