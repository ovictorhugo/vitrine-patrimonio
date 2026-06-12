import os

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

    # We want to replace the `if (!res.ok) ...` blocks that throw an error.
    # To do this safely without AST, we can find the index of "if (!res.ok)"
    # Then we check if it has a brace '{' or just a single statement.
    # We find where it ends, and replace the whole block.
    
    out = []
    i = 0
    while i < len(content):
        idx = content.find("if (!res.ok)", i)
        if idx == -1:
            out.append(content[i:])
            break
            
        # find end of if block
        out.append(content[i:idx])
        
        # We need to extract the if condition and block
        # Start of condition
        start = idx
        
        # We will do a simple brace counting for the block
        # First, find the first '{' after "if (!res.ok)"
        # Or if there's no '{', it's a single statement.
        
        # let's find the end of the condition first
        cond_end = content.find(")", idx)
        
        # Next non whitespace char
        next_char_idx = cond_end + 1
        while next_char_idx < len(content) and content[next_char_idx].isspace():
            next_char_idx += 1
            
        is_block = content[next_char_idx] == '{'
        
        if is_block:
            brace_count = 1
            end_idx = next_char_idx + 1
            while brace_count > 0 and end_idx < len(content):
                if content[end_idx] == '{':
                    brace_count += 1
                elif content[end_idx] == '}':
                    brace_count -= 1
                end_idx += 1
            block_content = content[start:end_idx]
            i = end_idx
        else:
            # Single statement (ends at semicolon)
            end_idx = content.find(";", next_char_idx) + 1
            block_content = content[start:end_idx]
            i = end_idx

        # If it doesn't contain "throw new Error", we just append it and continue
        if "throw new Error" not in block_content:
            out.append(block_content)
            continue
            
        # OK, it contains throw new Error! We need to replace it.
        # Let's extract the default error message if possible.
        import re
        msg_match = re.search(r'throw new Error\([^|]*\|\|\s*(`[^`]*`|"[^"]*"|\'[^\']*\')', block_content)
        if not msg_match:
            msg_match = re.search(r'throw new Error\(\s*(`[^`]*`|"[^"]*"|\'[^\']*\')', block_content)
            
        if msg_match:
            err_msg = msg_match.group(1).replace('`', '"')
        else:
            err_msg = '"Erro na requisição"'
            
        # Is there a 409 check inside? (Special case for remocao.tsx line 140)
        has_409 = "res.status === 409" in block_content
        
        indent = "      "
        
        replacement = f"""if (!res.ok) {{
{indent}  let errorMessage = {err_msg};
{indent}  try {{
{indent}    const errorData = await res.json();
{indent}    if (errorData?.detail) errorMessage = errorData.detail;
{indent}  }} catch {{}}"""
        
        if has_409:
            replacement += f"""\n{indent}  if (res.status === 409) {{ toast.error("Nome duplicado", {{ description: "Já existe uma coleção sua com este mesmo nome, por favor tente um nome diferente." }}); return; }}"""
            
        replacement += f"""\n{indent}  toast.error("Erro", {{ description: errorMessage }});\n{indent}  return;\n{indent}}}"""
        
        out.append(replacement)

    with open(filepath, "w") as f:
        f.write("".join(out))
    print(f"Patched {filepath}")

for f in files_to_fix:
    process_file(f)

