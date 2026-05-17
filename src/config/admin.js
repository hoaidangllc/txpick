export const ADMIN_EMAILS = ['ddh2755@gmail.com']

export function isAdminEmail(email) {
  if (!email) return false
  return ADMIN_EMAILS.map((item) => item.toLowerCase()).includes(String(email).toLowerCase())
}
