/**
 * Storage Utility
 * Handles LocalStorage and SessionStorage operations safely.
 */

const Storage = {
    // LocalStorage (Persistent)
    local: {
        get: (key) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error('Error reading from localStorage', e);
                return null;
            }
        },
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('Error writing to localStorage', e);
            }
        },
        remove: (key) => {
            localStorage.removeItem(key);
        }
    },

    // SessionStorage (Per Session)
    session: {
        get: (key) => {
            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error('Error reading from sessionStorage', e);
                return null;
            }
        },
        set: (key, value) => {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('Error writing to sessionStorage', e);
            }
        }
    }
};

// Initialize default user data if not present
if (!Storage.local.get('user_data')) {
    Storage.local.set('user_data', {
        visited: false,
        interactions: 0,
        theme: 'default'
    });
}
