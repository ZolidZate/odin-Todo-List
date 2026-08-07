const STORAGE_KEY = "todo_list_data";

export function saveToStorage(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}