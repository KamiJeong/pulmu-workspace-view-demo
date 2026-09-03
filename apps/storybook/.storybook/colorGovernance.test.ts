import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const TOKEN_SOURCE = "packages/tokens/src/global.css";
const ALLOWED_KEYWORDS = new Set([
  "transparent",
  "currentcolor",
  "canvas",
  "canvastext",
  "buttonface",
  "buttontext",
  "linktext",
]);
const COLOR_FUNCTIONS = new Set([
  "color",
  "color-mix",
  "contrast-color",
  "device-cmyk",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "light-dark",
  "oklab",
  "oklch",
  "rgb",
  "rgba",
]);
const CSS_ESCAPE = String.raw`\\(?:[\da-fA-F]{1,6}[ \t\r\n\f]?|[^\r\n\f\da-fA-F])`;
const CSS_IDENTIFIER = String.raw`-?(?:[_a-zA-Z]|${CSS_ESCAPE})(?:[-_a-zA-Z\d]|${CSS_ESCAPE})*`;

const CSS_NAMED_COLORS = new Set(`
  aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet
  brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue
  darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange
  darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise
  darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia
  gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory
  khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow
  lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray
  lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue
  mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred
  midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered
  orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue
  purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver
  skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet
  wheat white whitesmoke yellow yellowgreen accentcolor accentcolortext activetext buttonborder field
  fieldtext graytext highlight highlighttext mark marktext selecteditem selecteditemtext visitedtext
  activeborder activecaption appworkspace background buttonhighlight buttonshadow captiontext inactiveborder
  inactivecaption inactivecaptiontext infobackground infotext menu menutext scrollbar threedarkshadow
  threedface threedhighlight threedlightshadow threedshadow window windowframe windowtext
`.trim().split(/\s+/));

type Exception = {
  literal: string;
  path: string;
  reason: string;
};

// Exceptions must be exact, justified, and exercised. Prefer adding a token instead.
const EXCEPTIONS: readonly Exception[] = [];

type Finding = {
  index: number;
  literal: string;
};

const stripComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, (comment) =>
  comment.replace(/[^\n]/g, " "));

function decodeCssIdentifier(identifier: string) {
  return identifier.replace(
    /\\([\da-fA-F]{1,6}[ \t\r\n\f]?|[^\r\n\f\da-fA-F])/g,
    (_, escaped: string) => {
      const hexadecimal = escaped.trim();
      if (/^[\da-fA-F]+$/.test(hexadecimal)) {
        const codePoint = Number.parseInt(hexadecimal, 16);
        return codePoint === 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)
          ? "�"
          : String.fromCodePoint(codePoint);
      }
      return escaped;
    },
  );
}

function readFunctionLiteral(source: string, start: number, openParenthesis: number) {
  let depth = 0;
  let quote = "";
  for (let index = openParenthesis; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return source.slice(start, openParenthesis + 1);
}

function findColorLiterals(source: string): Finding[] {
  const findings: Finding[] = [];
  const functionPattern = new RegExp(`(?<![-_a-zA-Z\\d\\\\])(${CSS_IDENTIFIER})\\s*\\(`, "g");
  const hexPattern = /#[\da-f]{3,8}\b/gi;

  for (const match of source.matchAll(functionPattern)) {
    if (!COLOR_FUNCTIONS.has(decodeCssIdentifier(match[1]).toLowerCase())) continue;
    const openParenthesis = match.index + match[0].lastIndexOf("(");
    findings.push({
      index: match.index,
      literal: readFunctionLiteral(source, match.index, openParenthesis),
    });
  }
  for (const match of source.matchAll(hexPattern)) {
    findings.push({ index: match.index, literal: match[0] });
  }

  const declarationPattern = /(?:^|[;{])\s*(?:--[\w-]+|[\w-]+)\s*:\s*([^;{}]+)/gm;
  for (const declaration of source.matchAll(declarationPattern)) {
    const value = declaration[1];
    const valueOffset = declaration.index + declaration[0].lastIndexOf(value);
    const identifierPattern = new RegExp(`(?<![-_a-zA-Z\\d\\\\])${CSS_IDENTIFIER}`, "g");
    for (const token of value.matchAll(identifierPattern)) {
      const normalized = decodeCssIdentifier(token[0]).toLowerCase();
      if (CSS_NAMED_COLORS.has(normalized) && !ALLOWED_KEYWORDS.has(normalized)) {
        findings.push({ index: valueOffset + token.index, literal: token[0] });
      }
    }
  }

  return findings.sort((left, right) => left.index - right.index);
}

const formatFinding = (file: string, source: string, finding: Finding) => {
  const line = source.slice(0, finding.index).split("\n").length;
  return `${file}:${line}: ${finding.literal}`;
};
const formatFindings = (file: string, source: string) => findColorLiterals(source)
  .map((finding) => formatFinding(file, source, finding));

describe("CSS color governance", () => {
  it("recognizes prohibited literal syntaxes and ignores comments", () => {
    const source = stripComments(`
      /* color: #bad; */
      .sample {
        color: red;
        border-color: #abc;
        background: rgb(1 2 3 / 50%);
        outline-color: AccentColor;
        box-shadow: 0 0 1px oklch(50% 0.2 20);
      }
    `);

    expect(findColorLiterals(source).map(({ literal }) => literal)).toEqual([
      "red",
      "#abc",
      "rgb(1 2 3 / 50%)",
      "AccentColor",
      "oklch(50% 0.2 20)",
    ]);
  });

  it("reports modern and CSS-escaped color spellings with their source location", () => {
    const source = String.raw`.sample {
  color: device-cmyk(0 0.81 0.81 0.12 / 90%);
  background: r\67 b(1 2 3 / 50%);
  border-color: \72 ed;
  outline-color: color-mix(in srgb, light-dark(var(--light), var(--dark)) 50%, contrast-color(var(--surface)));
}`;

    expect(formatFindings("fixtures/escaped.css", source)).toEqual([
      "fixtures/escaped.css:2: device-cmyk(0 0.81 0.81 0.12 / 90%)",
      String.raw`fixtures/escaped.css:3: r\67 b(1 2 3 / 50%)`,
      String.raw`fixtures/escaped.css:4: \72 ed`,
      "fixtures/escaped.css:5: color-mix(in srgb, light-dark(var(--light), var(--dark)) 50%, contrast-color(var(--surface)))",
      "fixtures/escaped.css:5: light-dark(var(--light), var(--dark))",
      "fixtures/escaped.css:5: contrast-color(var(--surface))",
    ]);
  });

  it("accepts semantic variables and the narrow keyword allowlist", () => {
    const source = `
      .sample {
        color: var(--pulmu-color-text-primary);
        background: transparent;
        border-color: currentColor;
        outline-color: CanvasText;
        accent-color: LinkText;
      }
    `;

    expect(findColorLiterals(source)).toEqual([]);
  });

  it("keeps product CSS on governed tokens", () => {
    const repositoryRoot = path.resolve(import.meta.dirname, "../../..");
    const trackedCss = execFileSync("git", ["ls-files", "-z", "--", "apps", "packages"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }).split("\0").filter((file) => file.endsWith(".css") && file !== TOKEN_SOURCE);

    const usedExceptions = new Set<Exception>();
    const violations: string[] = [];

    for (const file of trackedCss) {
      const source = stripComments(readFileSync(path.join(repositoryRoot, file), "utf8"));
      for (const finding of findColorLiterals(source)) {
        const exception = EXCEPTIONS.find((candidate) =>
          candidate.path === file && candidate.literal === finding.literal);
        if (exception) {
          usedExceptions.add(exception);
          continue;
        }
        violations.push(formatFinding(file, source, finding));
      }
    }

    const unusedExceptions = EXCEPTIONS
      .filter((exception) => !usedExceptions.has(exception))
      .map(({ path: file, literal, reason }) => `unused exception: ${file}: ${literal} (${reason})`);

    expect([...violations, ...unusedExceptions], [
      "Arbitrary CSS colors are forbidden outside packages/tokens/src/global.css.",
      "Use a semantic custom property, or add an exact path + literal + reason exception.",
      ...violations,
      ...unusedExceptions,
    ].join("\n")).toEqual([]);
  });
});
