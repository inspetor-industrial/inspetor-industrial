export function formatUsername(username: string): string {
  const formattedUsername = username.split(' ')

  if (formattedUsername.length === 1) {
    return (
      formattedUsername[0][0].toUpperCase() +
      formattedUsername[0][1].toUpperCase()
    )
  }

  return (
    formattedUsername?.[0]?.[0]?.toUpperCase() +
    formattedUsername?.[1]?.[0]?.toUpperCase()
  )
}
