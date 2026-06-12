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

def generate_replacement(default_msg):
    return f"""      if (!res.ok) {{
        let errorMessage = {default_msg};
        try {{
          const errorData = await res.json();
          if (errorData?.detail) errorMessage = errorData.detail;
        }} catch {{}}
        toast.error("Erro", {{ description: errorMessage }});
        return;
      }}"""

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        continue
    with open(filepath, "r") as f:
        content = f.read()

    # Pattern 1: if (!res.ok) throw new Error(...)
    content = re.sub(
        r'if\s*\(!res\.ok\)\s*throw\s+new\s+Error\((.*?)\);',
        lambda m: generate_replacement(m.group(1).replace('`Falha', '"Falha').replace('})`', '})"').replace('`', '"')),
        content
    )

    # Pattern 2: if (!res.ok) { ... throw new Error(...) }
    # This is trickier. Let's do it with a more specific regex.
    # Usually it's:
    # if (!res.ok) {
    #   const text = await res.text().catch(() => "");
    #   throw new Error(text || "Erro ao...");
    # }
    
    def replacer_block(m):
        # m.group(0) is the whole block
        # we try to extract the default string
        err_msg_match = re.search(r'throw new Error\([^|]+\|\|\s*("[^"]+")\);', m.group(0))
        if err_msg_match:
            default_msg = err_msg_match.group(1)
        else:
            # fallback try to find just a string
            err_msg_match2 = re.search(r'throw new Error\(\s*("[^"]+")\s*\);', m.group(0))
            if err_msg_match2:
                default_msg = err_msg_match2.group(1)
            else:
                # fallback try backticks
                err_msg_match3 = re.search(r'throw new Error\(\s*(`[^`]+`)\s*\);', m.group(0))
                if err_msg_match3:
                    default_msg = err_msg_match3.group(1).replace('`', '"')
                else:
                    # fallback
                    err_msg_match4 = re.search(r'throw new Error\(\s*(.*?)\s*\);', m.group(0), re.DOTALL)
                    default_msg = '"Erro na requisição"'
        return generate_replacement(default_msg)

    content = re.sub(
        r'if\s*\(!res\.ok\)\s*\{[^}]*?throw new Error[^}]*?\}',
        replacer_block,
        content,
        flags=re.DOTALL
    )

    with open(filepath, "w") as f:
        f.write(content)
    print(f"Processed {filepath}")

