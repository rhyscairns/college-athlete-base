import sys

with open('src/scholarships/components/ScholarshipDetail.tsx', 'r') as f:
    content = f.read()

# Find and replace using a unique anchor string
anchor = "label={userType === 'player' ? 'Contribution Required' : 'Scholarship Amount'}"
if anchor not in content:
    print("ANCHOR NOT FOUND")
    sys.exit(1)

# Find the full DetailRow block by locating the surrounding context
old = """                <DetailRow
                    label={userType === 'player' ? 'Contribution Required' : 'Scholarship Amount'}
                    value={
                        userType === 'player'
                            ? `${scholarship.scholarshipAmount.toLocaleString()} / year`
                            : `${scholarship.scholarshipAmount.toLocaleString()}`
                    }
                />"""

new = """                <DetailRow
                    label={userType === 'player' ? 'Your Cost' : 'Scholarship Amount'}
                    value={
                        userType === 'player' && scholarship.annualCostPerPlayer !== undefined
                            ? (
                                <span>
                                    ${String(Math.max(0, (scholarship.annualCostPerPlayer ?? 0) - scholarship.scholarshipAmount)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')} / year
                                    <span className="ml-2 text-xs" style={{ color: 'var(--text-lo)' }}>
                                        (${scholarship.scholarshipAmount.toLocaleString()} scholarship off ${scholarship.annualCostPerPlayer.toLocaleString()} total)
                                    </span>
                                </span>
                            )
                            : userType === 'player'
                                ? `$${scholarship.scholarshipAmount.toLocaleString()} / year`
                                : `$${scholarship.scholarshipAmount.toLocaleString()}`
                    }
                />"""

# Check if old is in content
if old in content:
    content = content.replace(old, new)
    print("Replaced successfully")
else:
    # Try to find the block character by character
    idx = content.find(anchor)
    print(f"Anchor found at index {idx}")
    print(repr(content[idx-50:idx+300]))
    sys.exit(1)

with open('src/scholarships/components/ScholarshipDetail.tsx', 'w') as f:
    f.write(content)
