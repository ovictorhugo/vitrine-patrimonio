import os
import re

filepath = "src/components/dashboard/itens-vitrine/itens-vitrine.tsx"

with open(filepath, "r") as f:
    content = f.read()

# 1. Add state
content = content.replace(
    '  const [showFilters, setShowFilters] = useState(false);',
    '  const [showFilters, setShowFilters] = useState(false);\n  const [excludeNI, setExcludeNI] = useState(false);'
)

# 2. Add to fetchStatusCounts
content = content.replace(
    '      if (debouncedQ) params.set("q", debouncedQ);',
    '      if (debouncedQ) params.set("q", debouncedQ);\n      if (excludeNI) params.set("exclude_asset_status", "NI");'
)
content = content.replace(
    '    debouncedQ,\n  ]);',
    '    debouncedQ,\n    excludeNI,\n  ]);'
)

# 3. Add to fetchColumnData
content = content.replace(
    '        if (debouncedQ) params.set("q", debouncedQ);',
    '        if (debouncedQ) params.set("q", debouncedQ);\n        if (excludeNI) params.set("exclude_asset_status", "NI");'
)
content = content.replace(
    '      debouncedQ,\n    ],\n  );',
    '      debouncedQ,\n      excludeNI,\n    ],\n  );'
)

# 4. Add to useEffect replaceState
content = content.replace(
    '    else params.delete("q");\n\n    const newSearch = params.toString();',
    '    else params.delete("q");\n    if (excludeNI) params.set("exclude_asset_status", "NI");\n    else params.delete("exclude_asset_status");\n\n    const newSearch = params.toString();'
)

# 5. Add to clearFilters
content = content.replace(
    '    setLocations([]);\n  };',
    '    setLocations([]);\n    setExcludeNI(false);\n  };'
)

# 6. UI Desktop
content = content.replace(
    '''                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <Trash size={16} />
                      Limpar filtros
                    </Button>''',
    '''                    <Button
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
print("Patched itens-vitrine.tsx")
