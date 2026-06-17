import re
import os

files_to_check = [
    r"c:\Users\karth\OneDrive\Documents\GitHub\forge-route-landing\backend\main.py",
    r"c:\Users\karth\OneDrive\Documents\GitHub\forge-route-landing\src\utils\api.ts",
    r"c:\Users\karth\OneDrive\Documents\GitHub\forge-route-landing\src\routes\stops.tsx",
    r"c:\Users\karth\OneDrive\Documents\GitHub\forge-route-landing\src\routes\dashboard.tsx",
    r"c:\Users\karth\OneDrive\Documents\GitHub\forge-route-landing\src\routes\settings.tsx",
    r"c:\Users\karth\OneDrive\Documents\GitHub\forge-route-landing\src\routes\fleet.tsx",
    r"c:\Users\karth\OneDrive\Documents\GitHub\forge-route-landing\src\routes\routes.tsx",
    r"c:\Users\karth\OneDrive\Documents\GitHub\forge-route-landing\backend\test_kerala.py",
    r"c:\Users\karth\OneDrive\Documents\GitHub\forge-route-landing\landing\index.html",
    r"c:\Users\karth\OneDrive\Documents\GitHub\forge-route-landing\index.html",
    r"c:\Users\karth\OneDrive\Documents\GitHub\forge-route-landing\README.md"
]

def replace_in_file(filepath):
    if not os.path.exists(filepath):
        return

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return

    # Specific coordinate replacements based on user prompt
    content = re.sub(r'51\.505,\s*-0\.09', '9.9312, 76.2673', content)
    content = re.sub(r'51\.512,\s*-0\.10', '10.0269, 76.3050', content)

    # Replace specific addresses
    content = re.sub(r'12 Mill Rd', 'Fort Kochi, Kochi', content)
    content = re.sub(r'45 Oak Ave', 'Marine Drive, Kochi', content)
    content = re.sub(r'2 Station Sq', 'InfoPark, Kakkanad', content)
    content = re.sub(r'Warehouse,\s*London', 'Kaloor Junction, Kochi', content)
    
    # Generic London replacements in addresses
    content = re.sub(r',\s*London', ', Kochi', content)
    
    # Generic coordinate replacements for mock stops
    content = re.sub(r'lat:\s*51\.512,\s*lng:\s*-0\.100', 'lat: 10.0269, lng: 76.3050', content)
    content = re.sub(r'lat:\s*51\.498,\s*lng:\s*-0\.080', 'lat: 9.9700, lng: 76.2900', content)
    content = re.sub(r'lat:\s*51\.520,\s*lng:\s*-0\.110', 'lat: 10.0150, lng: 76.3550', content)
    content = re.sub(r'lat:\s*51\.495,\s*lng:\s*-0\.070', 'lat: 9.9680, lng: 76.3010', content)
    content = re.sub(r'lat:\s*51\.508,\s*lng:\s*-0\.095', 'lat: 9.9312, lng: 76.2673', content) 
    content = re.sub(r'lat:\s*51\.501,\s*lng:\s*-0\.085', 'lat: 9.9667, lng: 76.2422', content) 
    content = re.sub(r'lat:\s*51\.492,\s*lng:\s*-0\.090', 'lat: 9.9300, lng: 76.2600', content)
    content = re.sub(r'lat:\s*51\.505,\s*lng:\s*-0\.075', 'lat: 9.9400, lng: 76.2700', content)
    content = re.sub(r'lat:\s*51\.510,\s*lng:\s*-0\.115', 'lat: 9.9500, lng: 76.2800', content)
    content = re.sub(r'lat:\s*51\.500,\s*lng:\s*-0\.095', 'lat: 9.9600, lng: 76.2900', content)
    content = re.sub(r'lat:\s*51\.488,\s*lng:\s*-0\.088', 'lat: 9.9700, lng: 76.3000', content)
    content = re.sub(r'lat:\s*51\.495,\s*lng:\s*-0\.078', 'lat: 9.9800, lng: 76.3100', content)

    # Some fallback for generic London string (case sensitive to preserve styling if any)
    content = content.replace('London', 'Kochi')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")

for fp in files_to_check:
    replace_in_file(fp)

print("Done")
