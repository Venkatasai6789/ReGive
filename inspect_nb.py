import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

def inspect_notebook(path):

    print("==================================================")
    print(f"Inspecting Notebook: {path}")
    print("==================================================")
    with open(path, 'r', encoding='utf-8') as f:
        nb = json.load(f)

    for i, cell in enumerate(nb['cells']):
        cell_type = cell['cell_type']
        print(f"\n--- CELL {i} ({cell_type}) ---")
        source = "".join(cell.get('source', []))
        print(source)
        
        outputs = cell.get('outputs', [])
        if outputs:
            print("\n>>> OUTPUTS:")
            for out in outputs:
                if out.get('output_type') == 'stream':
                    print("".join(out.get('text', [])))
                elif out.get('output_type') in ['execute_result', 'display_data']:
                    data = out.get('data', {})
                    if 'text/plain' in data:
                        print("".join(data['text/plain']))
                    if 'image/png' in data:
                        print(f"[Image Output: {len(data['image/png'])} base64 chars]")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        inspect_notebook(sys.argv[1])
