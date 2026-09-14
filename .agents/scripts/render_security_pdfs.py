from pathlib import Path
import fitz

SOURCE_DIR = Path("attached_assets")
OUTPUT_DIR = Path(".agents/outputs/security-pdfs")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

pdfs = sorted(SOURCE_DIR.glob("Vibe-Coded_App_Security*.pdf"))
report_lines = []

for pdf_path in pdfs:
    document = fitz.open(pdf_path)
    report_lines.append(f"# {pdf_path.name}")
    report_lines.append(f"Pages: {document.page_count}")
    report_lines.append("")

    pdf_output = OUTPUT_DIR / pdf_path.stem
    pdf_output.mkdir(parents=True, exist_ok=True)

    for page_number, page in enumerate(document, start=1):
        pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        image_path = pdf_output / f"page-{page_number:02d}.png"
        pixmap.save(image_path)
        text = page.get_text("text").strip()
        report_lines.append(f"## Page {page_number}")
        report_lines.append(text)
        report_lines.append("")

    document.close()

(OUTPUT_DIR / "security-checklists.md").write_text(
    "\n".join(report_lines), encoding="utf-8"
)
print(f"Rendered {len(pdfs)} PDFs into {OUTPUT_DIR}")
print(f"Extracted text report: {OUTPUT_DIR / 'security-checklists.md'}")