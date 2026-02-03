import os
import re
from pathlib import Path

# =========================
# Configuration
# =========================

DRY_RUN = False           # True = affiche seulement, False = écrit les fichiers
MAX_FILES = 999           # nombre max de fichiers modifiés

PROJECT_LIBS = [
    "@everyboard/lib",
]

# =========================
# Regex & helpers
# =========================

IMPORT_REGEXP = re.compile(r"^import\s+.*?\s+from\s+['\"](.+?)['\"];?$")

def is_external_import(path: str) -> bool:
    return not path.startswith(".") and not any(
        path.startswith(lib) for lib in PROJECT_LIBS
    )

def is_project_lib_import(path: str) -> bool:
    return any(path.startswith(lib) for lib in PROJECT_LIBS)

def is_internal_import(path: str) -> bool:
    return path.startswith(".")

def count_parent_refs(path: str) -> int:
    return path.count("../")

# =========================
# Core logic
# =========================

def process_file(file_path: Path) -> bool:
    original: str = file_path.read_text(encoding="utf-8")
    lines: list[str] = original.splitlines()
    eslint_disable_header = None
    if lines and lines[0].startswith("/* eslint-disable"):
        eslint_disable_header = lines[0]
        lines = lines[1:]

    imports: list[str] = []
    other_lines: list[str] = []
    has_other_lines_encountered_non_breakline: bool = False

    for line in lines:
        match = IMPORT_REGEXP.match(line.strip())
        if match:
            imports.append(line)
        else:
            if has_other_lines_encountered_non_breakline:
                # once a non-import, non-blank line is encountered, all following lines are considered "other"
                other_lines.append(line)
            elif line.strip() != "":
                has_other_lines_encountered_non_breakline = True
                other_lines.append(line)

    if not imports:
        return False

    external_imports = []             # Outsides imports
    everyboard_libraries_imports = [] # Project library imports
    internal_imports = []             # Internal imports

    for import_line in imports:
        path = IMPORT_REGEXP.match(import_line.strip()).group(1)

        if is_external_import(path):
            external_imports.append(import_line)
        elif is_project_lib_import(path):
            everyboard_libraries_imports.append(import_line)
        elif is_internal_import(path):
            internal_imports.append(import_line)

    external_imports.sort(
        key=lambda line: IMPORT_REGEXP.match(line.strip()).group(1)
    )
    # Tri des imports internes (type C)
    internal_imports.sort(
        key = lambda line: (
            -count_parent_refs(IMPORT_REGEXP.match(line.strip()).group(1)),
            IMPORT_REGEXP.match(line.strip()).group(1),
        )
    )

    new_imports = []
    if external_imports:
        new_imports.extend(external_imports)
    if everyboard_libraries_imports:
        if new_imports:
            new_imports.append("")
        new_imports.extend(everyboard_libraries_imports)
    if internal_imports:
        if new_imports:
            new_imports.append("")
        new_imports.extend(internal_imports)

    new_content_parts = []
    if eslint_disable_header:
        new_content_parts.append(eslint_disable_header)

    new_content_parts.append("\n".join(new_imports))
    new_content_parts.append("")
    new_content_parts.append("\n".join(other_lines))

    new_content = "\n".join(new_content_parts).rstrip() + "\n"

    if new_content == original:
        return False
    else:
        if DRY_RUN:
            print(f"[DRY-RUN] {file_path} is now:")
            print(os.linesep.join(new_imports))
        else:
            with open(file_path, "w", encoding="utf-8", newline="\n") as f:
                f.write(new_content)
        return True

# =========================
# Entry point
# =========================

def run(root_dir: str):
    modified = 0

    for root, _, files in os.walk(root_dir):
        for file in files:
            if not file.endswith(".ts"):
                continue

            if modified >= MAX_FILES:
                print(f"Finished with {modified} modified files (max reached)")
                return

            file_path = Path(root) / file
            if process_file(file_path):
                modified += 1

    print(f"Finished with {modified} modified files (all files comply now)")

# =========================
# CLI
# =========================

if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Usage: python format_imports.py <dossier>")
        sys.exit(1)

    run(sys.argv[1])