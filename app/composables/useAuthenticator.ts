import * as OTPAuth from 'otpauth'

export const ACCOUNT_COLORS = [
  { name: 'Indigo', value: 'indigo', gradient: 'from-indigo-500 to-blue-600' },
  { name: 'Emerald', value: 'emerald', gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Orange', value: 'orange', gradient: 'from-orange-500 to-red-600' },
  { name: 'Pink', value: 'pink', gradient: 'from-pink-500 to-rose-600' },
  { name: 'Violet', value: 'violet', gradient: 'from-violet-500 to-purple-600' },
  { name: 'Cyan', value: 'cyan', gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Amber', value: 'amber', gradient: 'from-amber-500 to-orange-600' },
  { name: 'Fuchsia', value: 'fuchsia', gradient: 'from-fuchsia-500 to-pink-600' },
  { name: 'Slate', value: 'slate', gradient: 'from-slate-500 to-gray-700' },
  { name: 'Red', value: 'red', gradient: 'from-red-500 to-rose-700' }
] as const

export type AccountColor = typeof ACCOUNT_COLORS[number]['value']

export interface Account {
  id: string
  issuer: string
  label: string
  secret: string
  algorithm: string
  digits: number
  period: number
  color: AccountColor
}

const STORAGE_KEY = 'authenticator_accounts'

function loadAccounts(): Account[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAccounts(data: Account[]) {
  const plain = JSON.parse(JSON.stringify(data))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plain))
}

const accounts = ref<Account[]>([])

export function useAuthenticator() {
  function init() {
    accounts.value = loadAccounts()
  }

  function addAccount(opts: { issuer: string, label: string, secret: string, color?: AccountColor }) {
    const account: Account = {
      id: crypto.randomUUID(),
      issuer: opts.issuer,
      label: opts.label,
      secret: opts.secret.replace(/\s/g, '').toUpperCase(),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      color: opts.color || ACCOUNT_COLORS[Math.floor(Math.random() * ACCOUNT_COLORS.length)].value
    }
    accounts.value.push(account)
    saveAccounts(accounts.value)
    return account
  }

  function updateAccount(id: string, updates: Partial<Pick<Account, 'color' | 'issuer' | 'label'>>) {
    const account = accounts.value.find(a => a.id === id)
    if (account) {
      Object.assign(account, updates)
      saveAccounts(accounts.value)
    }
  }

  function removeAccount(id: string) {
    accounts.value = accounts.value.filter(a => a.id !== id)
    saveAccounts(accounts.value)
  }

  function generateCode(account: Account): string {
    const totp = new OTPAuth.TOTP({
      issuer: account.issuer,
      label: account.label,
      algorithm: account.algorithm,
      digits: account.digits,
      period: account.period,
      secret: OTPAuth.Secret.fromBase32(account.secret)
    })
    return totp.generate()
  }

  function getTimeRemaining(period: number = 30): number {
    return period - (Math.floor(Date.now() / 1000) % period)
  }

  function parseOtpauthUri(uri: string): { issuer: string, label: string, secret: string } | null {
    try {
      const parsed = OTPAuth.URI.parse(uri)
      if (parsed instanceof OTPAuth.TOTP) {
        return {
          issuer: parsed.issuer || 'Unknown',
          label: parsed.label || parsed.issuer || 'Unknown',
          secret: parsed.secret.base32
        }
      }
    } catch { /* ignore */ }
    return null
  }

  function importFromUris(text: string): number {
    const uris = text.match(/otpauth:\/\/totp\/[^\s]+/g) || []
    let count = 0
    for (const uri of uris) {
      const parsed = parseOtpauthUri(uri)
      if (!parsed) continue
      const exists = accounts.value.some(a => a.secret === parsed.secret && a.issuer === parsed.issuer)
      if (exists) continue
      accounts.value.push({
        id: crypto.randomUUID(),
        issuer: parsed.issuer,
        label: parsed.label,
        secret: parsed.secret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        color: ACCOUNT_COLORS[Math.floor(Math.random() * ACCOUNT_COLORS.length)].value
      })
      count++
    }
    if (count > 0) saveAccounts(accounts.value)
    return count
  }

  function exportAccounts(ids?: string[]): string {
    const toExport = ids
      ? accounts.value.filter(a => ids.includes(a.id))
      : accounts.value
    return JSON.stringify(toExport, null, 2)
  }

  function getOtpauthUri(account: Account): string {
    const totp = new OTPAuth.TOTP({
      issuer: account.issuer,
      label: account.label,
      algorithm: account.algorithm,
      digits: account.digits,
      period: account.period,
      secret: OTPAuth.Secret.fromBase32(account.secret)
    })
    return totp.toString()
  }

  function importAccounts(json: string): number {
    const parsed = JSON.parse(json)
    const arr: Account[] = Array.isArray(parsed) ? parsed : [parsed]
    let count = 0
    for (const item of arr) {
      if (!item.secret || !item.issuer) continue
      const exists = accounts.value.some(a => a.secret === item.secret && a.issuer === item.issuer)
      if (exists) continue
      accounts.value.push({
        id: item.id || crypto.randomUUID(),
        issuer: item.issuer,
        label: item.label || item.issuer,
        secret: item.secret,
        algorithm: item.algorithm || 'SHA1',
        digits: item.digits || 6,
        period: item.period || 30,
        color: item.color || ACCOUNT_COLORS[Math.floor(Math.random() * ACCOUNT_COLORS.length)].value
      })
      count++
    }
    saveAccounts(accounts.value)
    return count
  }

  return {
    accounts: readonly(accounts),
    init,
    addAccount,
    updateAccount,
    removeAccount,
    generateCode,
    getTimeRemaining,
    exportAccounts,
    getOtpauthUri,
    importAccounts,
    importFromUris
  }
}
