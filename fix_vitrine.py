import re

filepath = "src/components/dashboard/itens-vitrine/itens-vitrine.tsx"

with open(filepath, "r") as f:
    content = f.read()

# Fix duplication
content = content.replace(
    '        if (excludeNI) params.set("exclude_asset_status", "NI");\n      if (excludeNI) params.set("exclude_asset_status", "NI");',
    '        if (excludeNI) params.set("exclude_asset_status", "NI");'
)

# Add to mobile view
content = content.replace(
    '''              <Button variant="outline" size="sm" onClick={clearFilters}>
                <Trash size={16} />
                Limpar filtros
              </Button>''',
    '''              <Button
                size={"sm"}
                variant={excludeNI ? "default" : "outline"}
                onClick={() => setExcludeNI(!excludeNI)}
              >
                Apenas patrimoniado
              </Button>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <Trash size={16} />
                Limpar filtros
              </Button>'''
)

with open(filepath, "w") as f:
    f.write(content)

