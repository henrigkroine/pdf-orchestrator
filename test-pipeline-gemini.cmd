@echo off
set DRY_RUN_GEMINI_VISION=1
python pipeline.py --validate --pdf "exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf" --job-config "example-jobs/tfu-aws-partnership-v2.json"
