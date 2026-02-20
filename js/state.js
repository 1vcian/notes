export const state = {
    files: JSON.parse(localStorage.getItem('notex-files')) || [],
    activeId: localStorage.getItem('notex-active-id'),
    fileToDelete: null
};

export function syncState() {
    try {
        const local = localStorage.getItem('notex-files');
        if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
                state.files = parsed;
            }
        }
    } catch (e) {
        console.error('Failed to sync files from localStorage', e);
    }
}

export function saveState() {
    localStorage.setItem('notex-files', JSON.stringify(state.files));
    localStorage.setItem('notex-active-id', state.activeId);
}
