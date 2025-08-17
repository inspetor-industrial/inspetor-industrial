export function formatUsername(username: string): string {
  const formattedUsername = username.split(' ')

  return (
    formattedUsername?.[0]?.[0]?.toUpperCase() +
    formattedUsername?.[1]?.[0]?.toUpperCase()
  )
}
