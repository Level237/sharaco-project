import os
import glob
import re

templates_dir = "Api/app/templates"
files = glob.glob(os.path.join(templates_dir, "*.html"))

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Look for: .header, .parties, .items-section, .summary-section, .schedule-section { page-break-inside: avoid; }
    # Or variations of it. We just want to remove .items-section from page-break-inside: avoid;
    
    # Simple regex replacement
    # Pattern: .items-section,
    # or , .items-section
    new_content = re.sub(r'\.items-section\s*,\s*', '', content)
    new_content = re.sub(r',\s*\.items-section', '', new_content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")
    else:
        print(f"No changes for {filepath}")
