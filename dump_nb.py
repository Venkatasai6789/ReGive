import json
import sys

def dump_nb(filepath, outpath):
    with open(filepath, 'r', encoding='utf-8') as f:
        nb = json.load(f)
    with open(outpath, 'w', encoding='utf-8') as out:
        out.write(f"=== NOTEBOOK: {filepath} ===\n")
        out.write(f"Total cells: {len(nb.get('cells', []))}\n")
        for idx, cell in enumerate(nb.get('cells', [])):
            ctype = cell.get('cell_type')
            source = "".join(cell.get('source', []))
            out.write(f"\n--- CELL {idx} [{ctype}] ---\n")
            out.write(source + "\n")
            outputs = cell.get('outputs', [])
            if outputs:
                out.write(">>> OUTPUTS:\n")
                for o in outputs:
                    if o.get('output_type') == 'stream':
                        out.write("".join(o.get('text', [])) + "\n")
                    elif o.get('output_type') in ['execute_result', 'display_data']:
                        data = o.get('data', {})
                        if 'text/plain' in data:
                            out.write("".join(data['text/plain']) + "\n")
                        if 'image/png' in data:
                            out.write(f"[Image base64: {len(data['image/png'])} chars]\n")

if __name__ == '__main__':
    dump_nb(sys.argv[1], sys.argv[2])
