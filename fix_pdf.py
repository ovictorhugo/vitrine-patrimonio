import re

filepath = "src/components/dashboard/itens-vitrine/itens-vitrine.tsx"

with open(filepath, "r") as f:
    content = f.read()

content = content.replace(
    'location_id: sectorId || undefined,\n                    }}',
    'location_id: sectorId || undefined,\n                      exclude_asset_status: excludeNI ? "NI" : undefined,\n                    }}'
)

content = content.replace(
    'location_id: sectorId || undefined,\n                  }}',
    'location_id: sectorId || undefined,\n                    exclude_asset_status: excludeNI ? "NI" : undefined,\n                  }}'
)

with open(filepath, "w") as f:
    f.write(content)

