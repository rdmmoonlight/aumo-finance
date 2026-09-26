// server/utils/auth.ts - sementara hardcode biar build lolos
export async function getUserId(event: any) {
  // TODO: ganti dengan auth asli lu
  // contoh kalo pake nuxt-auth-utils:
  // const session = await requireUserSession(event)
  // return session.user.id

  // sementara return dummy UUID biar gak error
  const dummy = '00000000-0000-0000-0000-000000000000'
  return dummy
}
