@echo off
set DRY_RUN_GEMINI_VISION=1
node scripts/gemini-vision-review.js --pdf "exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf" --job-config "example-jobs/tfu-aws-partnership-v2.json" --output "reports/gemini/test-review.json" --min-score 0.92
