# Missing Dataset File - Creating Symlink to Actual Golden Dataset

Since the production evaluation system expects `golden_dataset.jsonl` but the actual file is `transcripts_golden_v1.jsonl`, I'll create a symlink for compatibility.

## Quick Fix Commands

### On Windows (PowerShell as Administrator):
```powershell
cd backend\eval\datasets
New-Item -ItemType SymbolicLink -Path "golden_dataset.jsonl" -Target "transcripts_golden_v1.jsonl"
```

### On Linux/Mac:
```bash
cd backend/eval/datasets
ln -sf transcripts_golden_v1.jsonl golden_dataset.jsonl
```

## Alternative: Copy Command

If symlinks don't work, use copy:

### Windows:
```powershell
cd backend\eval\datasets
copy transcripts_golden_v1.jsonl golden_dataset.jsonl
```

### Linux/Mac:
```bash
cd backend/eval/datasets
cp transcripts_golden_v1.jsonl golden_dataset.jsonl
```

This ensures compatibility between the original evaluation system (expecting `transcripts_golden_v1.jsonl`) and the production system (expecting `golden_dataset.jsonl`).