// import { createTask } from "./tasks";
/* export */ function createProject(title) {
    const id = crypto.randomUUID();
    const tasks = [];

    return {
        get id() { return id; },
        title,
        tasks,

        addTask(task) {
            this.tasks.push(task);
        }
    };
}

const defaultProject = createProject("Default Project");
// defaultProject.addTask("Test task", "Just a test for functionality", "low", ["Check 1", "Check 2", "Check 3"]);
// console.log(defaultProject);

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
console.log(JSON.stringify(defaultProject, null, 2));