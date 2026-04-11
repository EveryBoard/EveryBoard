#!/usr/bin/env python3
"""
HTML formatter for Angular templates.
- 4 spaces indentation
- First attribute on same line as opening tag
- Remaining attributes aligned under first attribute
- Supports Angular control flow (@if, @for, @else, @switch, @defer, etc.)
- Does NOT reorder attributes
- Does NOT touch innerHTML content
"""

import re
import sys
from pathlib import Path

INDENT = "    "

VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}


def parse_attrs(s):
    result = []
    s = s.strip()
    i = 0
    while i < len(s):
        if s[i].isspace():
            i += 1
            continue
        j = i
        while j < len(s) and s[j] not in ('=', ' ', '\t', '\n', '\r'):
            j += 1
        name = s[i:j]
        i = j
        if not name:
            i += 1
            continue
        # Skip whitespace before potential =
        k = i
        while k < len(s) and s[k] in (' ', '\t'):
            k += 1
        if k < len(s) and s[k] == '=':
            i = k
        if i < len(s) and s[i] == '=':
            i += 1
            # Skip whitespace after =
            while i < len(s) and s[i] in (' ', '\t'):
                i += 1
            if i < len(s) and s[i] in ('"', "'"):
                quote = s[i]
                i += 1
                end = s.index(quote, i)
                value = s[i:end]
                i = end + 1
                result.append(f'{name}="{value}"')
            else:
                j = i
                while j < len(s) and not s[j].isspace():
                    j += 1
                result.append(f'{name}={s[i:j]}')
                i = j
        else:
            result.append(name)
    return result


def format_open_tag(tag_name, attrs_str, closing, pad):
    attrs = parse_attrs(attrs_str)
    prefix = f"<{tag_name}"
    if not attrs:
        return f"{prefix}{closing}"
    align = " " * (len(pad) + len(prefix) + 1)
    lines = [f"{prefix} {attrs[0]}"]
    for a in attrs[1:]:
        lines.append(f"{align}{a}")
    return "\n".join(lines) + closing


def collect_lines(source):
    source = source.replace("\r\n", "\n").replace("\r", "\n")
    raw = source.split("\n")
    out = []
    i = 0
    while i < len(raw):
        line = raw[i].strip()
        if not line:
            out.append("")
            i += 1
            continue
        # Join multi-line opening HTML tags (but not closing tags)
        if re.match(r"^<[a-zA-Z]", line) and not line.startswith("</"):
            buf = line
            while not re.search(r'(?:/>|>)', buf):
                if i + 1 >= len(raw):
                    break
                i += 1
                buf += " " + raw[i].strip()
            out.append(buf)
            i += 1
            continue
        out.append(line)
        i += 1
    return out


def render(lines):
    output = []
    level = 0

    for line in lines:
        if not line:
            output.append("")
            continue

        pad = INDENT * level

        # } @else ... { continuation
        if re.match(r'^\}\s*@(else|case)\b', line):
            level = max(0, level - 1)
            pad = INDENT * level
            output.append(f"{pad}{line}")
            level += 1
            continue

        # Lone closing brace
        if line == "}":
            level = max(0, level - 1)
            output.append(f"{INDENT * level}}}")
            continue

        # Angular block opener ending with {
        if re.match(r'^@\w+.*\{$', line):
            output.append(f"{pad}{line}")
            level += 1
            continue

        # HTML closing tag
        if re.match(r'^</[\w][\w.:-]*', line):
            level = max(0, level - 1)
            output.append(f"{INDENT * level}{line}")
            continue

        # Comment / doctype
        if line.startswith("<!--") or line.startswith("<!"):
            output.append(f"{pad}{line}")
            continue

        # Opening HTML tag
        m = re.match(r'^(<([\w][\w.:-]*))([\s\S]*?)(\/?>)([\s\S]*)$', line)
        if m:
            tag_name = m.group(2)
            attrs_str = m.group(3)
            closing = m.group(4)
            after = m.group(5).strip()

            is_void = tag_name.lower() in VOID_TAGS
            is_self_closing = closing == "/>"

            # Check if the tag is closed inline (e.g. <p ...>text</p>)
            close_re = re.compile(rf'</{re.escape(tag_name)}\s*>', re.IGNORECASE)
            is_closed_inline = bool(close_re.search(after))

            formatted = format_open_tag(tag_name, attrs_str, closing, pad)
            output.append(f"{pad}{formatted}{after}" if after else f"{pad}{formatted}")

            if not is_void and not is_self_closing and not is_closed_inline:
                level += 1
            continue

        # Plain text / expression
        output.append(f"{pad}{line}")

    while output and not output[-1].strip():
        output.pop()
    return "\n".join(output) + "\n"


def format_html(source):
    return render(collect_lines(source))


def main():
    paths = sys.argv[1:]
    if not paths:
        print("Usage: format_html.py file1.html [file2.html ...]")
        sys.exit(1)
    for path_str in paths:
        path = Path(path_str)
        if not path.exists():
            print(f"Skipping {path}: not found")
            continue
        original = path.read_text(encoding="utf-8")
        formatted = format_html(original)
        path.write_text(formatted, encoding="utf-8")
        print(f"Formatted: {path}")

if __name__ == "__main__":
    main()
