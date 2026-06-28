import { describe, it, expect } from 'vitest'
import { scanSensitive } from '../src/scan-sensitive'

describe('scanSensitive (strict: secrets AND PII)', () => {
  const cases: Array<[string, string, string]> = [
    ['aws access key', 'AKIAIOSFODNN7EXAMPLE', 'aws_access_key'],
    ['github token', `ghp_${'a'.repeat(36)}`, 'github_token'],
    ['jwt', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.abcDEFghiJKLmno', 'jwt'],
    ['private key', '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKC', 'private_key'],
    ['supabase secret', 'sb_secret_abcDEF123456', 'supabase_key'],
    ['credential assignment', 'password: hunter2supersecret', 'credential_assignment'],
    ['private ip', 'the box at 10.0.3.14 runs it', 'private_ip'],
    ['internal host', 'see db.internal for details', 'internal_host'],
    ['email', 'reach me at john.doe@example.com', 'email'],
    ['phone intl', 'call +1 (415) 555-2671 today', 'phone'],
    ['phone us', 'ring 415-555-2671', 'phone'],
    ['stripe live key', 'sk_live_abcDEF0123456789xyz', 'stripe_key'],
    ['openai key', 'sk-proj-abc123DEF456ghi789jkl', 'openai_key'],
    ['db connection uri', 'postgres://admin:s3cretPw@db.example.com:5432/app', 'db_connection_uri'],
  ]

  for (const [name, text, cat] of cases) {
    it(`flags ${name}`, () => {
      expect(scanSensitive(text)).toContain(cat)
    })
  }

  it('never returns the raw secret value, only categories', () => {
    const cats = scanSensitive(`ghp_${'z'.repeat(36)}`)
    expect(cats.join(' ')).not.toContain('zzzz')
  })

  it('passes clean learning content', () => {
    expect(scanSensitive('Notes on React hooks and the useEffect cleanup pattern.')).toEqual([])
  })

  it('does not flag an ISO date as a phone number', () => {
    expect(scanSensitive('Read chapter 12 on 2024-01-01.')).toEqual([])
  })

  // Regression guard against alarm-fatigue false positives.
  it.each([
    ['scikit-learn slug', 'Notes on sk-learn-pipeline-tutorial and cross-validation'],
    ['code with a secret-named variable', 'const secret = computeValue()'],
    ['bare order number', 'order number 123456789012 shipped'],
    ['dotted .local filename', 'edit config.local then restart'],
  ])('does not false-positive on %s', (_name, text) => {
    expect(scanSensitive(text)).toEqual([])
  })
})
