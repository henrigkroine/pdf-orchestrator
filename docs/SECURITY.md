# Security Policy

**Project**: PDF Orchestrator
**Last Updated**: 2025-11-05
**Owner**: TEEI Technical Team

---

## Key Handling

### Storage Locations

**Production Secrets** (NEVER commit to git):
- `T:\Secrets\teei\teei.env` - Central TEEI secrets vault
- `config/.env` - Project-specific active configuration

**Templates** (safe to commit):
- `config/.env.example` - Variable names and comments only

### Environment Variables by Service

#### Adobe Services
```bash
# JWT Service-to-Service (PDF Services)
ADOBE_CLIENT_ID=<client_id>
ADOBE_CLIENT_SECRET=<client_secret>
ADOBE_ORGANIZATION_ID=<org_id>
ADOBE_ACCESS_TOKEN=<jwt_token>  # 1000-day token, created 2025-11-03

# OAuth Web App (Lightroom)
ADOBE_LIGHTROOM_CLIENT_ID=<client_id>
ADOBE_LIGHTROOM_API_KEY=<api_key>

# API Keys (Express, API Mesh)
ADOBE_EXPRESS_CLIENT_ID=<client_id>
ADOBE_API_MESH_CLIENT_ID=<client_id>
```

#### AI/ML Providers
```bash
ANTHROPIC_API_KEY=<sk-ant-...>
OPENAI_API_KEY=<sk-proj-...>
GEMINI_API_KEY=<AIza...>
```

#### Image Services
```bash
ARTIFICIO_API_KEY=<key>
UNSPLASH_ACCESS_KEY=<key>
UNSPLASH_SECRET_KEY=<secret>
```

#### Cloud Storage
```bash
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>
```

### Private Key Storage

**Adobe JWT Private Key**:
- **Location**: `T:\Secrets\teei\adobe\pdf-services-private.key`
- **Format**: PEM-encoded RSA private key
- **Permissions**: Read-only for orchestrator service account
- **Never**: Store in repo, logs, or error messages

**Loading Private Key**:
```javascript
const fs = require('fs');
const privateKey = fs.readFileSync(
  process.env.ADOBE_PRIVATE_KEY_PATH,
  'utf8'
);
```

---

## Key Rotation Policy

### Rotation Schedule

| Service | Rotation Frequency | Owner | Alert Threshold |
|---------|-------------------|-------|-----------------|
| Adobe PDF Services | 365 days | Tech Lead | 30 days before expiry |
| Lightroom OAuth | 90 days | Tech Lead | 14 days before expiry |
| OpenAI API | 180 days | Tech Lead | 30 days before expiry |
| Anthropic API | 180 days | Tech Lead | 30 days before expiry |
| Gemini API | 180 days | Tech Lead | 30 days before expiry |
| Unsplash API | 365 days | Tech Lead | 60 days before expiry |
| R2 Access Keys | 180 days | DevOps | 30 days before expiry |

### Rotation SOP (Standard Operating Procedure)

#### 1. Pre-Rotation Checklist
- [ ] Verify new key generation in provider console
- [ ] Test new key in staging environment
- [ ] Schedule maintenance window (if downtime expected)
- [ ] Notify team 48 hours in advance

#### 2. Rotation Steps
1. Generate new key in provider console
2. Add new key to secrets vault (`T:\Secrets\teei\teei.env`)
3. Update `config/.env` with new key
4. Test in staging environment
5. Deploy to production
6. Monitor for 24 hours
7. Revoke old key in provider console
8. Document rotation in changelog

#### 3. Post-Rotation Verification
- [ ] Run integration test suite
- [ ] Verify all API calls successful
- [ ] Check cost tracking systems
- [ ] Update rotation log: `docs/KEY_ROTATION_LOG.md`

### Automatic Rotation

**Services with Auto-Rotation** (future implementation):
- Use secret management service (AWS Secrets Manager, HashiCorp Vault)
- Implement key versioning
- Zero-downtime rotation with dual-key support

---

## Leak Response Protocol

### Detection

**Monitoring for Leaked Secrets**:
- GitHub secret scanning (enabled)
- Pre-commit hooks (git-secrets)
- Log sanitization (redact API keys in logs)
- CI/CD secret scanning (trufflehog)

### Response Procedure

#### SEVERITY: CRITICAL (Public Exposure)

**Immediate Actions** (within 15 minutes):
1. **REVOKE** exposed key in provider console
2. **GENERATE** new key immediately
3. **UPDATE** secrets vault and production config
4. **VERIFY** no unauthorized usage in provider logs
5. **NOTIFY** security team and stakeholders

**Follow-up Actions** (within 24 hours):
1. Review all API logs for unauthorized access
2. Assess financial impact (unauthorized charges)
3. Update incident log: `docs/SECURITY_INCIDENTS.md`
4. Conduct post-mortem
5. Implement preventive measures

#### SEVERITY: HIGH (Internal Exposure)

**Immediate Actions** (within 1 hour):
1. Assess scope of exposure (who, when, where)
2. Rotate key if exposure confirmed
3. Audit access logs
4. Document incident

**Follow-up Actions** (within 7 days):
1. Review access controls
2. Implement additional safeguards
3. Training for exposed individuals

#### SEVERITY: MEDIUM (Suspected Exposure)

**Actions** (within 24 hours):
1. Investigate exposure claims
2. Review relevant logs
3. Rotate key if confirmed
4. Update security procedures

### Provider-Specific Revocation

**Adobe**:
- Console: https://developer.adobe.com/console
- Navigate to Project → Credentials → Revoke

**OpenAI**:
- Console: https://platform.openai.com/api-keys
- Click "Revoke" next to exposed key

**Anthropic**:
- Console: https://console.anthropic.com/settings/keys
- Delete compromised key

**Gemini**:
- Console: https://aistudio.google.com/app/apikey
- Delete API key

**Unsplash**:
- Console: https://unsplash.com/oauth/applications
- Revoke access token

**Cloudflare R2**:
- Console: https://dash.cloudflare.com/
- R2 → Manage R2 API Tokens → Revoke

---

## Authentication Models

### Adobe PDF Services (JWT Service-to-Service)

**Type**: JWT (JSON Web Token)
**Lifetime**: 1000 days (token created 2025-11-03, expires ~2027-10)
**Renewal**: Manual regeneration before expiry

**Header Format**:
```
Authorization: Bearer <ACCESS_TOKEN>
x-api-key: <CLIENT_ID>
```

**Token Generation** (when expired):
```bash
# Using Adobe IMS API
curl -X POST https://ims-na1.adobelogin.com/ims/token/v3 \
  -d "client_id=<CLIENT_ID>" \
  -d "client_secret=<CLIENT_SECRET>" \
  -d "grant_type=client_credentials" \
  -d "scope=openid,AdobeID,DCAPI"
```

**Scopes Required**:
- `DCAPI` - Document Cloud API access
- `openid` - OpenID Connect
- `AdobeID` - Adobe Identity

### Adobe Lightroom (OAuth Web App)

**Type**: OAuth 2.0
**Token Lifetime**:
- Access Token: 24 hours
- Refresh Token: 14 days

**Redirect URIs**:
- Production: `https://pdf-orchestrator.teei.org/oauth/callback`
- Staging: `https://pdf-orchestrator-staging.pages.dev/oauth/callback`
- Local: `http://localhost:3000/oauth/callback`

**Scopes Required**:
- `openid` - OpenID Connect
- `lr_partner_apis` - Lightroom API access
- `lr_partner_rendition_read` - Read renditions
- `lr_partner_rendition_create` - Create renditions

**Refresh Token Flow**:
```javascript
async function refreshLightroomToken(refreshToken) {
  const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ADOBE_LIGHTROOM_CLIENT_ID,
      client_secret: process.env.ADOBE_LIGHTROOM_CLIENT_SECRET,
      refresh_token: refreshToken
    })
  });

  if (!response.ok) throw new Error('Token refresh failed');
  return await response.json(); // { access_token, refresh_token, expires_in }
}
```

**Retry Policy**:
- **401 Unauthorized**: Attempt refresh, retry once
- **429 Too Many Requests**: Exponential backoff
- **500+ Server Error**: Retry 3x with jitter

### API Keys (Express, API Mesh, Unsplash, AI Models)

**Type**: Static API Keys
**Lifetime**: Varies by provider (180-365 days)

**Header Format**:
```
# Adobe Express/API Mesh
x-api-key: <API_KEY>

# OpenAI
Authorization: Bearer <API_KEY>

# Anthropic
x-api-key: <API_KEY>
anthropic-version: 2023-06-01

# Gemini
x-goog-api-key: <API_KEY>

# Unsplash
Authorization: Client-ID <ACCESS_KEY>
```

---

## Allowed Domains Configuration

### Adobe Express Embed SDK

**Allowed Domains** (configure in Adobe Developer Console):
- `theeducationalequalityinstitute.org`
- `*.theeducationalequalityinstitute.org`
- `pdf-orchestrator.teei.org`
- `*.pages.dev` (Cloudflare Pages preview domains)

**NO Wildcards Beyond Org**: Do not use `*` or `*.com` patterns.

### CORS Configuration

**PDF Orchestrator API** (`config/cors.config.json`):
```json
{
  "allowedOrigins": [
    "https://theeducationalequalityinstitute.org",
    "https://pdf-orchestrator.teei.org",
    "https://*.pages.dev"
  ],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowedHeaders": ["Content-Type", "Authorization", "x-api-key"],
  "exposedHeaders": ["x-request-id", "x-cost-estimate"],
  "credentials": true,
  "maxAge": 86400
}
```

---

## Access Control

### Service Account Permissions

**Orchestrator Service Account**:
- Read access to `T:\Secrets\teei\`
- Write access to `T:\Projects\pdf-orchestrator\logs\`
- Write access to `T:\Projects\pdf-orchestrator\exports\`
- Network access to Adobe APIs, AI providers, Cloudflare R2

### Human Access

**Secrets Vault** (`T:\Secrets\teei\`):
- **Read/Write**: Tech Lead, DevOps Lead
- **Read Only**: Senior Developers
- **No Access**: Junior Developers, Contractors (use staging keys)

### API Key Segmentation

**Development**:
- Separate API keys for dev/staging
- Lower rate limits
- Isolated R2 buckets
- Test Adobe credentials

**Production**:
- Dedicated API keys
- Full rate limits
- Production R2 buckets
- Production Adobe credentials

---

## Audit Logging

### Security Events to Log

```json
{
  "timestamp": "2025-11-05T10:30:00Z",
  "event": "api_key_rotated",
  "service": "openai",
  "actor": "tech-lead@teei.org",
  "old_key_id": "sk-proj-abc123...",
  "new_key_id": "sk-proj-xyz789...",
  "ip_address": "203.0.113.42"
}
```

**Events to Log**:
- API key generation
- API key rotation
- API key revocation
- Authentication failures
- Rate limit violations
- Suspicious API usage patterns
- Secrets vault access
- Configuration changes

### Log Retention

- **Security logs**: 2 years
- **API access logs**: 90 days
- **Error logs**: 1 year
- **Audit trail**: Indefinite

**Storage**: `T:\Projects\pdf-orchestrator\logs\security\`

---

## Compliance

### Data Protection

**PII Handling**:
- No PII in logs
- No PII in error messages
- Sanitize all inputs before API calls
- Redact sensitive data in telemetry

**Data Retention**:
- Generated PDFs: 30 days in staging, 90 days in production
- API request logs: 90 days
- Cost telemetry: 1 year

### Provider Data Policies

**OpenAI**: Data not used for training (verified with zero data retention agreement)
**Anthropic**: Data not used for training by default
**Gemini**: Data may be used for model improvement (opt-out configured)
**Unsplash**: Attribution required, track download IDs
**Adobe**: TEEI owns all generated content

---

## Incident Response Contacts

**Tech Lead**: henrik@theeducationalequalityinstitute.org
**Security Team**: security@teei.org
**On-Call**: +1-XXX-XXX-XXXX (PagerDuty)

**Escalation Path**:
1. On-call engineer (immediate)
2. Tech Lead (within 15 minutes)
3. CTO (critical incidents)
4. Legal (data breach)

---

## Review Schedule

- **Weekly**: Review API usage anomalies
- **Monthly**: Audit access logs and key expiration
- **Quarterly**: Full security audit and penetration test
- **Annually**: Update security policy and incident playbooks

**Next Review Due**: 2025-12-05
