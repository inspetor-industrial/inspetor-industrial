export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  )

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256,
  )

  const hashArray = new Uint8Array(hashBuffer)
  const combined = new Uint8Array(salt.length + hashArray.length)
  combined.set(salt)
  combined.set(hashArray, salt.length)

  return btoa(String.fromCharCode(...combined))
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)

    const combined = new Uint8Array(
      atob(hash)
        .split('')
        .map((char) => char.charCodeAt(0)),
    )

    const salt = combined.slice(0, 16)
    const originalHash = combined.slice(16)

    const key = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits'],
    )

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      256,
    )

    const newHash = new Uint8Array(hashBuffer)

    return timingSafeEqual(originalHash, newHash)
  } catch {
    return false
  }
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]
  }

  return result === 0
}
