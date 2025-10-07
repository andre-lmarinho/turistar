from pathlib import Path
lines = Path('tests/unit/shared/lib/geoapify.test.ts').read_text().splitlines()
for i, line in enumerate(lines, 1):
    if 'keeps address-like' in line or "expect(results)" in line and '10 Downing St' in line:
        print(f'{i}: {line}')
