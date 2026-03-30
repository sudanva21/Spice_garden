import fitz
import sys

def extract_text(pdf_path, txt_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print("Text extracted successfully to " + txt_path)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    if len(sys.argv) > 2:
        extract_text(sys.argv[1], sys.argv[2])
    else:
        print("Please provide PDF path and output TXT path")
