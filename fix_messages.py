import os
import re

files_to_fix = [
    "src/components/dashboard/remocao/remocao.tsx",
    "src/components/dashboard/remocao/collection-page.tsx",
    "src/components/removiveis/removiveis.tsx",
    "src/components/removiveis/collection-page.tsx",
    "src/components/dashboard/remocao/tabs/administrator.tsx",
    "src/components/removiveis/tabs/administrator.tsx",
    "src/components/dashboard/remocao/components/patrimonio-item-inventario.tsx",
    "src/components/removiveis/components/patrimonio-item-inventario.tsx",
]

def process_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, "r") as f:
        content = f.read()

    # Replace occurrences like ` (HTTP ${res.status})`
    # The string might look like `"Falha ao carregar coleções (HTTP ${res.status})"`
    # So we want to replace ` \(HTTP \$\{res\.status\}\)` with ``
    content = re.sub(r'\s*\(HTTP \$\{res\.status\}\)', '', content)
    
    with open(filepath, "w") as f:
        f.write(content)
    print(f"Cleaned {filepath}")

for f in files_to_fix:
    process_file(f)

