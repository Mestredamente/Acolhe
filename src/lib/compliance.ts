export function isRecordLocked(createdAt?: string): boolean {
  if (!createdAt) return false
  const createdDate = new Date(createdAt).getTime()
  const now = new Date().getTime()
  const diffInHours = (now - createdDate) / (1000 * 60 * 60)
  return diffInHours > 24
}
