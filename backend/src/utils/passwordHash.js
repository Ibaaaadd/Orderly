const crypto = require('crypto')

function hashPassword(password, iterations = 100000) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex')
  return `pbkdf2_sha512$${iterations}$${salt}$${hash}`
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false

  const [algorithm, iterationsRaw, salt, expectedHash] = storedHash.split('$')
  if (algorithm !== 'pbkdf2_sha512' || !iterationsRaw || !salt || !expectedHash) return false

  const iterations = parseInt(iterationsRaw, 10)
  if (!Number.isInteger(iterations) || iterations <= 0) return false

  const computedHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex')
  const expectedBuffer = Buffer.from(expectedHash, 'hex')
  const computedBuffer = Buffer.from(computedHash, 'hex')

  if (expectedBuffer.length !== computedBuffer.length) return false
  return crypto.timingSafeEqual(expectedBuffer, computedBuffer)
}

module.exports = {
  hashPassword,
  verifyPassword,
}
