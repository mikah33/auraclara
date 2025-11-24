// ========================================
// AURA CLARA - Supabase Client
// ========================================

const SUPABASE_URL = 'https://pcyohjfdxkujufprlkxh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeW9oamZkeGt1anVmcHJsa3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNDI1MzUsImV4cCI6MjA3NTYxODUzNX0.AkCD_O-CewziIehY1Dwwea_3OYsTTPuqdgRmLR8f7NY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'auraclara-auth',
        storage: window.localStorage,
        flowType: 'pkce'
    }
});

// Export auth helper functions
window.AuraClaraAuth = {
    supabase,

    // Get current user
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error getting user:', error);
            return null;
        }
        return user;
    },

    // Get current session
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Error getting session:', error);
            return null;
        }
        return session;
    },

    // Sign up with email/password
    async signUp(email, password, fullName = '') {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                },
                emailRedirectTo: `${window.location.origin}?verified=true`
            }
        });

        if (error) {
            console.error('Sign up error:', error);
            throw error;
        }

        return data;
    },

    // Sign in with email/password
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Sign in error:', error);
            throw error;
        }

        return data;
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    },

    // Reset password
    async resetPassword(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}?reset=true`
        });

        if (error) {
            console.error('Password reset error:', error);
            throw error;
        }

        return data;
    },

    // Update user password
    async updatePassword(newPassword) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Password update error:', error);
            throw error;
        }

        return data;
    },

    // Resend verification email
    async resendVerification(email) {
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email: email
        });

        if (error) {
            console.error('Resend verification error:', error);
            throw error;
        }

        return data;
    },

    // Listen to auth state changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
};

console.log('✨ Supabase auth client initialized');
