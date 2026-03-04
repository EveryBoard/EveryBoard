#!/usr/bin/env python
import os
import re
from pathlib import Path

# This script reorders import so that they adhere to the following rules:
# 1. only relative imports (enforced by linter)
# 2. shortest possible path ('../a' cannot be written '../../b/a') (enforced only by this script)
# 3. divided in three category separated by an empty line (enforced by linter)
#    1. the external libraries
#    2. external everyboard sub-projects
#    3. internal imports
# 4. each category are then sorted in alphabetical order or import path (enforced by linter)


# =========================
# Configuration
# =========================

# The "internal" libraries of the project
PROJECT_LIBS = [
    "@everyboard/lib",
]

# The files that should not be touched
EXCLUDED_PATHS = [
    Path("src/test.ts") # shoul not be touched for preserving test executability
]

# =========================
# Regex & helpers
# =========================

IMPORT_REGEXP = re.compile(r"^import .* from '(.+)';")

def is_external_import(path: str) -> bool:
    """Returns true if the import is an external library (not relative, not from our project)"""
    return not path.startswith(".") and not any(
        path.startswith(lib) for lib in PROJECT_LIBS
    )

def is_project_lib_import(path: str) -> bool:
    """Returns true if the import is from our project, but not relative (e.g. @everyboard/lib)"""
    return any(path.startswith(lib) for lib in PROJECT_LIBS)

def is_internal_parent_import(path: str) -> bool:
    """Returns true if the import is relative (starts with "..")"""
    return path.startswith("..")

def is_internal_parent_sibling_import(path: str) -> bool:
    """Returns true if the import is relative (starts with "./")"""
    return path.startswith("./")

def count_parent_refs(path: str) -> int:
    return path.count("../")

def map_internal_import(file_path: str, import_line: str) -> str:
    current_dir = os.path.dirname(file_path)
    import_line = import_line.replace(os.sep, "/")
    if import_line.startswith("."):
        target_path = os.path.normpath(os.path.join(current_dir, import_line))
    else:
        target_path = os.path.normpath(import_line)
    rel = os.path.relpath(target_path, start=current_dir)
    rel = rel.replace(os.sep, "/")
    if rel.endswith(".ts"):
        rel = rel[:-3]
    if not rel.startswith("."):
        rel = "./" + rel
    return rel

# =========================
# Core logic
# =========================

def process_file(file_path: Path, is_dry_run: bool) -> bool:
    original: str = file_path.read_text(encoding="utf-8")
    lines: list[str] = original.splitlines()
    eslint_disable_header = None
    if lines and lines[0].startswith("/*"):
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
    internal_parent_imports = []      # Internal imports starting by "../"
    internal_sibling_imports = []     # Internal imports starting by "./"

    for import_line in imports:
        path = IMPORT_REGEXP.match(import_line.strip()).group(1)

        if is_external_import(path):
            external_imports.append(import_line)
        elif is_project_lib_import(path):
            everyboard_libraries_imports.append(import_line)
        elif is_internal_parent_import(path):
            mapped_internal_import = map_internal_import(file_path, path)
            new_internal_parent_import_line = import_line.replace(path, mapped_internal_import)
            internal_parent_imports.append(new_internal_parent_import_line)
        elif is_internal_parent_sibling_import(path):
            mapped_internal_import = map_internal_import(file_path, path)
            new_internal_sibling_import_line = import_line.replace(path, mapped_internal_import)
            internal_sibling_imports.append(new_internal_sibling_import_line)

    external_imports.sort(
        # ortographical order of import path (not imported elements)
        key=lambda line: IMPORT_REGEXP.match(line.strip()).group(1)
    )
    internal_parent_imports.sort(
        key = lambda line: (
            # proximity to the file (number of "../" in the path, less is closer)
            -count_parent_refs(IMPORT_REGEXP.match(line.strip()).group(1)),
            # ortographical order of import path (not imported elements)
            IMPORT_REGEXP.match(line.strip()).group(1),
        )
    )
    internal_sibling_imports.sort(
        key = lambda line: (
            # ortographical order of import path (not imported elements)
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
    if internal_parent_imports:
        if new_imports:
            new_imports.append("")
        new_imports.extend(internal_parent_imports)
    if internal_sibling_imports:
        if new_imports:
            new_imports.append("")
        new_imports.extend(internal_sibling_imports)

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
        if is_dry_run:
            print(f"[DRY-RUN] {file_path} is now:")
            print(os.linesep.join(new_imports))
        else:
            with open(file_path, "w", encoding="utf-8", newline="\n") as f:
                f.write(new_content)
        return True

def run(root_dir: str, is_dry_run: bool, max_files: int):
    modified = 0

    for root, _, files in os.walk(root_dir):
        for file in files:
            if not file.endswith(".ts"):
                continue

            if max_files > 0 and modified >= max_files:
                print(f"Finished with {modified} modified files (max reached)")
                return

            file_path = Path(root) / file
            if file_path in EXCLUDED_PATHS:
                continue
            if process_file(file_path, is_dry_run):
                modified += 1

    print(f"Finished with {modified} modified files (all files comply now)")

if __name__ == "__main__":
    import sys

    if len(sys.argv) != 4:
        print(f"Usage: {sys.argv[0]} <path> <is-dry-run> <max-files>")
        print("  <path> is the path where to recursively adapt imports (in all .ts files)")
        print("  <is-dry-run> is true to do a dry run, anything else otherwise")
        print("  <max-files> is a positive integer to only change this number of files, or a negative for unlimited changes")
        print(f"  the usual way to run it is: {sys.argv[0]} src/ false -1")
        sys.exit(1)

    run(sys.argv[1],
        sys.argv[2].lower() == "true",
        int(sys.argv[3])
    )
