import { createTask } from "./tasks.js";
import { createEl } from "./createDom.js";
import { loadFromStorage, saveToStorage } from "./storage.js";

let projects = [];

export function createProject(title, id = null, tasks = []) {
    const actualId = id || crypto.randomUUID();

    return {
        get id() { return actualId; },
        title,
        tasks,

        addTask(task) {
            this.tasks.push(task);
            saveProjectsData();
        }
    };
}

export function addProject(project) {
    projects.push(project);
    saveProjectsData();
}

export function getProjects() {
    return projects;
}

export function removeProject(id) {
    const index = projects.findIndex(project => project.id === id);
    if(index !== -1) {
        projects.splice(index, 1);
        saveProjectsData();
    }
}

export function saveProjectsData() {
    saveToStorage(projects);
}

const storedData = loadFromStorage();

if (storedData && storedData.length > 0) {
    projects = storedData.map(projData => {
        return createProject(projData.title, projData.id, projData.tasks);
    });
} else {
    const defaultProject = createProject("Default Project");
    
    const defaultTask = createTask({
        title: "Test task",
        description: "This is just a test task to test functionality",
        priority: "low",
        checklist: [
            { title: "Check 1", isCompleted: false },
            { title: "Check 2", isCompleted: false },
            { title: "Check 3", isCompleted: true }
        ]
    });

    defaultProject.addTask(defaultTask);
    projects.push(defaultProject);
    saveProjectsData(); 
}