export const isSupabaseConfigured = true

export const supabase = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Mock auth state change listener
      return {
        data: { subscription: { unsubscribe: () => {} } },
      }
    },
    signInWithPassword: (credentials: any) => {
      // Mock authentication for demo purposes
      if (credentials.email && credentials.password) {
        return Promise.resolve({
          data: { user: { email: credentials.email, id: "1" } },
          error: null,
        })
      }
      return Promise.resolve({ error: { message: "Invalid credentials" } })
    },
    signUp: (credentials: any) => {
      // Mock sign up for demo purposes
      if (credentials.email && credentials.password) {
        return Promise.resolve({
          data: { user: { email: credentials.email, id: "1" } },
          error: null,
        })
      }
      return Promise.resolve({ error: { message: "Invalid credentials" } })
    },
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => Promise.resolve({ data: [], error: null }),
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
  }),
}
