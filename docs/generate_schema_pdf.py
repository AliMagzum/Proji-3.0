#!/usr/bin/env python3
"""Generate Proji DATABASE_SCHEMA.pdf from DATABASE_SCHEMA.md"""

from __future__ import annotations

import re
from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).parent
MD_PATH = ROOT / "DATABASE_SCHEMA.md"
OUT_PATH = ROOT / "Proji_DATABASE_SCHEMA.pdf"
FONT = "/Library/Fonts/Arial Unicode.ttf"


class SchemaPDF(FPDF):
    def footer(self):
        self.set_y(-12)
        self.set_font("ArialUni", size=8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"Proji — структура БД  |  стр. {self.page_no()}", align="C")


def clean_inline(text: str) -> str:
    text = text.replace("`", "")
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", text)
    return text.strip()


def write_wrapped(pdf: SchemaPDF, text: str, size: int = 10, style: str = "", indent: float = 0):
    pdf.set_font("ArialUni", size=size)
    pdf.set_text_color(30, 30, 30)
    pdf.set_x(pdf.l_margin + indent)
    w = pdf.w - pdf.l_margin - pdf.r_margin - indent
    pdf.multi_cell(w, 5.5, text)
    pdf.ln(1)


def write_code(pdf: SchemaPDF, lines: list[str]):
    pdf.set_fill_color(245, 247, 250)
    pdf.set_font("ArialUni", size=7.5)
    pdf.set_text_color(20, 20, 20)
    for line in lines:
        if pdf.get_y() > 270:
            pdf.add_page()
        pdf.set_x(pdf.l_margin)
        w = pdf.w - pdf.l_margin - pdf.r_margin
        pdf.multi_cell(w, 4.2, line.replace("\t", "    "), fill=True)
    pdf.ln(2)


def parse_table_row(line: str) -> list[str]:
    parts = [p.strip() for p in line.strip().strip("|").split("|")]
    return parts


def write_table(pdf: SchemaPDF, rows: list[list[str]]):
    if not rows:
        return
    cols = len(rows[0])
    w = pdf.w - pdf.l_margin - pdf.r_margin
    col_w = w / cols
    pdf.set_font("ArialUni", size=8)
    for i, row in enumerate(rows):
        if pdf.get_y() > 265:
            pdf.add_page()
        if i == 1 and all(re.fullmatch(r":?-+:?", c.replace(" ", "")) for c in row):
            continue
        pdf.set_x(pdf.l_margin)
        is_header = i == 0
        if is_header:
            pdf.set_fill_color(230, 240, 255)
            pdf.set_text_color(30, 30, 30)
        else:
            pdf.set_fill_color(255, 255, 255)
            pdf.set_text_color(40, 40, 40)
        pdf.set_font("ArialUni", size=8)
        for j, cell in enumerate(row):
            pdf.cell(col_w, 6, clean_inline(cell)[:42], border=1, fill=True)
        pdf.ln(6)
    pdf.ln(2)


def build_pdf():
    text = MD_PATH.read_text(encoding="utf-8")
    lines = text.splitlines()

    pdf = SchemaPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_font("ArialUni", "", FONT)
    pdf.add_page()

    i = 0
    table_buf: list[str] = []
    code_buf: list[str] | None = None
    skip_details = 0

    while i < len(lines):
        line = lines[i]

        if line.strip().startswith("<details") or line.strip().startswith("<summary"):
            i += 1
            continue
        if line.strip() == "</details>":
            i += 1
            continue

        if code_buf is not None:
            if line.strip().startswith("```"):
                write_code(pdf, code_buf)
                code_buf = None
            else:
                code_buf.append(line)
            i += 1
            continue

        if line.strip().startswith("```"):
            lang = line.strip()[3:].strip()
            code_buf = []
            i += 1
            continue

        if "|" in line and line.strip().startswith("|"):
            table_buf.append(line)
            i += 1
            continue
        elif table_buf:
            rows = [parse_table_row(r) for r in table_buf]
            write_table(pdf, rows)
            table_buf = []

        if not line.strip():
            i += 1
            continue

        if line.startswith("# "):
            if pdf.page_no() > 1 or pdf.get_y() > 30:
                pdf.add_page()
            pdf.set_text_color(37, 99, 235)
            write_wrapped(pdf, clean_inline(line[2:]), size=16, style="B")
            pdf.ln(2)
        elif line.startswith("## "):
            if pdf.get_y() > 250:
                pdf.add_page()
            pdf.set_text_color(30, 64, 175)
            write_wrapped(pdf, clean_inline(line[3:]), size=13, style="B")
            pdf.ln(1)
        elif line.startswith("### "):
            pdf.set_text_color(51, 65, 85)
            write_wrapped(pdf, clean_inline(line[4:]), size=11, style="B")
        elif line.strip() == "---":
            pdf.ln(2)
        elif line.startswith(">"):
            write_wrapped(pdf, clean_inline(line.lstrip("> ")), size=9)
        elif line.startswith("- ") or re.match(r"^\d+\. ", line):
            write_wrapped(pdf, "• " + clean_inline(re.sub(r"^\d+\.\s*", "", line.lstrip("- "))), size=9, indent=4)
        else:
            write_wrapped(pdf, clean_inline(line), size=9)

        i += 1

    if table_buf:
        rows = [parse_table_row(r) for r in table_buf]
        write_table(pdf, rows)
    if code_buf:
        write_code(pdf, code_buf)

    pdf.output(str(OUT_PATH))
    print(f"Created: {OUT_PATH} ({OUT_PATH.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build_pdf()
