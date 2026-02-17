import type { FileData, FileFormat, FormatHandler } from "../FormatHandler.ts";
// @ts-ignore
import { query, convert } from "pandoc-wasm";

// note: tables below taken from https://github.com/pandoc/pandoc-wasm/blob/main/demo/src/index.js

// extension table
const extensions: Record<string, string> = {
  "html": "html", "html5": "html", "html4": "html", "chunkedhtml": "zip",
  "markdown": "md", "markdown_strict": "md", "markdown_mmd": "md", "markdown_phpextra": "md",
  "gfm": "md", "commonmark": "md", "commonmark_x": "md",
  "latex": "tex", "beamer": "tex", "context": "tex",
  "pdf": "pdf", "docx": "docx", "odt": "odt",
  "epub": "epub", "epub2": "epub", "epub3": "epub",
  "rst": "rst", "org": "org", "plain": "txt",
  "json": "json", "native": "native",
  "docbook": "xml", "docbook4": "xml", "docbook5": "xml",
  "jats": "xml", "tei": "xml", "man": "1", "rtf": "rtf",
  "textile": "textile", "mediawiki": "wiki",
  "asciidoc": "adoc", "asciidoctor": "adoc", "asciidoc_legacy": "adoc",
  "revealjs": "html", "slidy": "html", "slideous": "html", "dzslides": "html", "s5": "html",
  "ipynb": "ipynb", "typst": "typ", "texinfo": "texi", "ms": "ms", "icml": "icml",
  "opml": "opml", "bibtex": "bib", "biblatex": "bib", "csljson": "json",
  "pptx": "pptx", "djot": "dj", "fb2": "fb2", "opendocument": "xml", "vimdoc": "txt"
}
// mime type table
const mimeTypes: Record<string, string> = {
  "html": "text/html", "html5": "text/html5", "html4": "text/html4", "chunkedhtml": "application/chunkedhtml+zip",
  "markdown": "text/markdown", "markdown_strict": "text/strict+markdown", "markdown_mmd": "text/mmd+markdown", "markdown_phpextra": "text/phpextra+markdown",
  "gfm": "text/gfm+markdown", "commonmark": "text/commonmark+markdown", "commonmark_x": "text/commonmark_x+markdown",
  "latex": "application/x-tex", "beamer": "application/beamer+x-tex", "context": "application/context+x-tex",
  "pdf": "application/pdf", "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "odt": "application/vnd.oasis.opendocument.text",
  "epub": "application/epub+zip", "epub2": "application/epub2+zip", "epub3": "application/epub3+zip",
  "rst": "text/x-rst", "org": "text/x-org", "plain": "text/plain",
  "json": "application/json", "native": "text/x-native",
  "docbook": "application/docbook+xml", "docbook4": "application/docbook4+xml", "docbook5": "application/docbook5+xml",
  "jats": "application/jats+xml", "tei": "application/tei+xml", "man": "text/troff", "rtf": "application/rtf",
  "textile": "application/x-textile", "mediawiki": "text/x-mediawiki",
  "asciidoc": "text/x-asciidoc", "asciidoctor": "text/x-asciidoctor", "asciidoc_legacy": "text/x-asciidoctor",
  "revealjs": "text/revealjs+html", "slidy": "text/slidy+html", "slideous": "text/slideous+html", "dzslides": "text/dzslides+html", "s5": "text/s5+html",
  "ipynb": "application/x-ipynb", "typst": "application/x-typ", "texinfo": "application/x-texinfo", "ms": "text/troff", "icml": "text/x-icml",
  "opml": "application/x-opml", "bibtex": "application/x-bibtex", "biblatex": "application/x-biblatex", "csljson": "application/csl+json",
  "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation", "djot": "application/x-djot", "fb2": "application/x-fb2", "opendocument": "application/opendocument+xml", "vimdoc": "text/x-vimdoc",
  "csv": "text/csv"
}
// format name table
const formatNames: Record<string, string> = {
  ansi: 'ANSI terminal',
  asciidoc: 'modern AsciiDoc',
  asciidoc_legacy: 'AsciiDoc for asciidoc-py',
  asciidoctor: 'AsciiDoctor (= modern AsciiDoc)',
  bbcode: 'BBCode',
  beamer: 'LaTeX Beamer slides',
  biblatex: 'BibLaTeX bibliography',
  bibtex: 'BibTeX bibliography',
  bits: 'BITS XML, alias for jats',
  chunkedhtml: 'zip of linked HTML files',
  commonmark: 'CommonMark Markdown',
  commonmark_x: 'CommonMark with extensions',
  context: 'ConTeXt',
  creole: 'Creole 1.0',
  csljson: 'CSL JSON bibliography',
  csv: 'CSV table',
  djot: 'Djot markup',
  docbook: 'DocBook v4',
  docbook5: 'DocBook v5',
  docx: 'Word',
  dokuwiki: 'DokuWiki markup',
  dzslides: 'DZSlides HTML slides',
  endnotexml: 'EndNote XML bibliography',
  epub: 'EPUB v3',
  epub2: 'EPUB v2',
  epub3: 'EPUB v3',
  fb2: 'FictionBook2',
  gfm: 'GitHub-Flavored Markdown',
  haddock: 'Haddock markup',
  html: 'HTML',
  html4: 'XHTML 1.0 Transitional',
  html5: 'HTML',
  icml: 'InDesign ICML',
  ipynb: 'Jupyter notebook',
  jats: 'JATS XML',
  jira: 'Jira/Confluence wiki markup',
  json: 'JSON version of native AST',
  latex: 'LaTeX',
  man: 'roff man',
  markdown: "Pandoc's Markdown",
  markdown_mmd: 'MultiMarkdown',
  markdown_phpextra: 'PHP Markdown Extra',
  markdown_strict: 'original unextended Markdown',
  markua: 'Markua',
  mdoc: 'mdoc manual page markup',
  mediawiki: 'MediaWiki markup',
  ms: 'roff ms',
  muse: 'Muse',
  native: 'native Haskell',
  odt: 'OpenDocument text',
  opendocument: 'OpenDocument XML',
  opml: 'OPML',
  org: 'Emacs Org mode',
  pdf: 'PDF via Typst',
  plain: 'plain text',
  pod: 'Perl POD',
  pptx: 'PowerPoint',
  revealjs: 'reveal.js HTML slides',
  ris: 'RIS bibliography',
  rst: 'reStructuredText',
  rtf: 'Rich Text Format',
  s5: 'S5 HTML slides',
  slideous: 'Slideous HTML slides',
  slidy: 'Slidy HTML slides',
  t2t: 'txt2tags',
  tei: 'TEI Simple',
  texinfo: 'GNU Texinfo',
  textile: 'Textile',
  tikiwiki: 'TikiWiki markup',
  tsv: 'TSV table',
  twiki: 'TWiki markup',
  typst: 'Typst',
  vimdoc: 'Vimdoc',
  vimwiki: 'Vimwiki',
  xlsx: 'Excel spreadsheet',
  xml: 'XML version of native AST',
  xwiki: 'XWiki markup',
  zimwiki: 'ZimWiki markup'
}

/// Handles pandoc integration
class pandocHandler implements FormatHandler {
  public name = "pandoc";
  public ready = false;

  public supportedFormats: FileFormat[] = [];

  async init() {
    const inputs = new Set<string>(await query({ query: "input-formats" }));
    const outputs = new Set<string>(await query({ query: "output-formats" }));
    for(const format of new Set([...inputs, ...outputs])) {
      if(format == "pdf" || format == "typst")
        continue; // these require typst which we don't have!
      this.supportedFormats.push({
        name: formatNames[format] ?? format,
        format: format,
        mime: mimeTypes[format] ?? "application/x-"+format,
        extension: extensions[format] ?? format,
        from: inputs.has(format),
        to: outputs.has(format),
        internal: format
      })
    }
    this.ready = true;
  }

  async doConvert (
    inputFiles: FileData[],
    inputFormat: FileFormat,
    outputFormat: FileFormat
  ): Promise<FileData[]> {
    return Promise.all(inputFiles.map(async(file) => {
      console.log(
        {
          input: new Blob([file.bytes as Uint8Array<ArrayBuffer>])
        }
      );
      const converted = (await convert(
        {
          from: inputFormat.internal,
          to: outputFormat.internal,
          "input-file": "input",
          "output-file": "output",
          standalone: true
        },
        null,
        {
          input: new Blob([file.bytes as Uint8Array<ArrayBuffer>])
        }
      )).files["output"];
      if(converted == undefined)
        throw new Error("Conversion failed!");
      console.log(converted);
      return {
        name: file.name.split(".")[0]+"."+outputFormat.extension,
        bytes: typeof converted == "string" ? new TextEncoder().encode(converted) : await (converted as Blob).bytes()
      };
    }));
  }
}

export default pandocHandler;
