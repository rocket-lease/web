const noop = () => {}
const stub = { data: { session: null, subscription: { unsubscribe: noop } }, error: null }

export const createClient = () => ({
  auth: {
    getSession: () => Promise.resolve(stub),
    onAuthStateChange: () => stub,
    signInWithPassword: () => Promise.resolve(stub),
    signUp: () => Promise.resolve(stub),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: null }),
  },
  storage: {
    from: () => ({
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      upload: () => Promise.resolve({ data: null, error: null }),
      remove: () => Promise.resolve({ error: null }),
    }),
  },
})
