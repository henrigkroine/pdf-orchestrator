# Credentials Setup

## ✅ Already Configured

The following credentials have been populated from your YPAI project:

### Cloudflare R2 Storage
- ✅ Account ID
- ✅ Access Key ID
- ✅ Secret Access Key
- ✅ Endpoint URL

**Source**: `T:\Dev\VS Projects\Wesbite\Website YPAI\.env`

### Cloudflare API
- ✅ API Token
- ✅ Account ID

### AI Enhancement
- ✅ Anthropic API Key (Claude)
- ✅ Gemini API Key (Google)

**Purpose**: Intelligent job routing and content analysis

### MCP Server
- ✅ Default configuration (localhost:8012)

### Adobe PDF Services
- ✅ Client ID
- ✅ Organization ID
- ✅ Access Token (expires in 1000 days from 2025-11-03)
- ⚠️ Client Secret (still needed for some operations)

**Status**: Access token configured - ready for PDF Services API calls!

## 🪣 R2 Bucket Setup

✅ **READY** - Bucket `pdf-outputs` created successfully!

**Details:**
- Name: `pdf-outputs`
- Location: EEUR (Eastern Europe)
- Storage Class: Standard
- Created: 2025-11-03T09:07:16.067Z

The bucket is ready to receive PDF outputs from the orchestrator.

## 🔐 Security Notes

- ✅ `.env` file is in `.gitignore`
- ✅ Never commit credentials to Git
- ✅ All credentials from trusted sources (YPAI project)
- ⚠️ Adobe credentials need manual setup

## Testing

After setting up Adobe credentials:

```bash
# Test that .env loads correctly
node -e "require('dotenv').config({path:'./config/.env'}); console.log('R2 Account:', process.env.R2_ACCOUNT_ID)"

# Should output: c1c7a153e1a721cf045e750659678795
```

## Credential Sources

| Credential | Source Location | Status |
|------------|----------------|--------|
| R2 Keys | YPAI Website .env | ✅ Complete |
| CF API Token | YPAI Website .env | ✅ Complete |
| Anthropic Key | YPAI Website .env | ✅ Complete |
| Gemini Key | YPAI Website .env | ✅ Complete |
| Adobe Client ID | Adobe Console | ✅ Complete |
| Adobe Org ID | Adobe Console | ✅ Complete |
| Adobe Access Token | Adobe Console | ✅ Complete (1000 day expiry) |
| Adobe Client Secret | Adobe Console | ⚠️ Optional (for token refresh) |
