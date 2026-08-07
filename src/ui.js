import { createEl } from "./createDom.js";
import { getProjects, createProject, addProject, removeProject, saveProjectsData } from "./projects.js";
import { createTask } from "./tasks.js";
import { format } from "date-fns";

let currentActiveProject = null;
let isSortActive = false;
let isFormOpen = false;

export function showSidebar() {
    const projectContainer = document.querySelector(".left-col");
    if(!projectContainer) return;

    projectContainer.textContent = "";

    const projectTitle = createEl("h2", "left-col-title");
    projectTitle.textContent = "Projects";
    projectContainer.appendChild(projectTitle);

    const activeProjects = getProjects();

    activeProjects.forEach((project) => {
        const line = createEl("div", "project-line");

        if (currentActiveProject && project.id === currentActiveProject.id) {
            line.classList.add("active-project-row");
        }

        const heading = createEl("h3");
        heading.textContent = project.title;
        line.appendChild(heading);

        const deleteBtn = createEl("button", "delete-project-btn");
        deleteBtn.textContent = "X";

        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            removeProject(project.id);

            if (currentActiveProject && currentActiveProject.id === project.id) {
                const remaining = getProjects();
                currentActiveProject = remaining.length > 0 ? remaining : null;
            }

            refreshUI();
        });
        line.appendChild(deleteBtn);

        line.addEventListener("click", () => {
            currentActiveProject = project;
            isFormOpen = false;
            refreshUI();
        });

        projectContainer.appendChild(line);
    });
}

export function showProjectContent(project) {
    const taskContainer = document.querySelector(".content");
    if(!taskContainer) return;

    taskContainer.textContent = "";

    if (!project) {
        const emptyNotice = createEl("p", "empty-notice");
        emptyNotice.textContent = "Select or create a project to get started!";
        taskContainer.appendChild(emptyNotice);
        return;
    }
    const contentHeader = createEl("div", "content-header-row");

    const projectHeader = createEl("h1", "active-project-title");
    projectHeader.textContent = project.title;
    contentHeader.appendChild(projectHeader);

    const actionButtonsWrapper = createEl("div", "content-actions-wrapper");

    const sortBtn = createEl("button", `action-toggle-btn ${isSortActive ? 'active-toggle' : ''}`);
    sortBtn.textContent = isSortActive ? "Sorting: Soonest First" : "Sort by Due Date";
    sortBtn.addEventListener("click", () => {
        isSortActive = !isSortActive;
        refreshUI();
    });

    const openFormBtn = createEl("button", "action-open-form-btn");
    openFormBtn.textContent = "Add Task";

    actionButtonsWrapper.appendChild(sortBtn);
    actionButtonsWrapper.appendChild(openFormBtn);
    contentHeader.appendChild(actionButtonsWrapper);
    taskContainer.appendChild(contentHeader);

    const taskFormWrapper = createEl("div", `task-form-wrapper ${isFormOpen ? "" : "hidden"}`);

    openFormBtn.addEventListener("click", () => {
        taskFormWrapper.classList.toggle("hidden");
        openFormBtn.textContent = taskFormWrapper.classList.contains("hidden") ? "Add Task" : "Cancel";
    });

    const formHeading = createEl("h3");
    formHeading.textContent = "Add New Task";
    taskFormWrapper.appendChild(formHeading);

    const taskForm = createEl("form", null, { id: "new-task-form" });

    const inputTitle = createEl("input", null, {
        type: "text",
        id: "task-title",
        placeholder: "Task Name",
        required: true,
        autocomplete: "off"
    });

    const textareaDesc = createEl("textarea", null, {
        id: "task-desc",
        placeholder: "Task Details/Description"
    });

    const inputDate = createEl("input", null, {
        type: "date",
        id: "task-due-date"
    });

    const selectPriority = createEl("select", null, { id: "task-priority" });

    ["Low", "Medium", "High"].forEach((level) => {
        const option = createEl("option", null, {
            value: level,
            textContent: level,
            selected: level === "Medium"
        });
        selectPriority.appendChild(option);
    });

    const submitBtn = createEl("button", null, {
        type: "submit",
        textContent: "Save Task"
    });

    taskForm.appendChild(inputTitle);
    taskForm.appendChild(textareaDesc);
    taskForm.appendChild(inputDate);
    taskForm.appendChild(selectPriority);
    taskForm.appendChild(submitBtn);
    taskFormWrapper.appendChild(taskForm);
    taskContainer.appendChild(taskFormWrapper);

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const newTask = createTask({
            title: inputTitle.value,
            description: textareaDesc.value,
            dueDate: inputDate.value || null,
            priority: selectPriority.value,
            checklist: []
        });

        project.addTask(newTask);
        isFormOpen = false;
        refreshUI();
    });

    let tasksToDisplay = [...project.tasks];

    if(isSortActive){
        tasksToDisplay.sort((a, b) => {
            if(!a.dueDate) return 1;
            if(!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }

    tasksToDisplay.forEach((task) => {
        const trueTaskIndex = project.tasks.findIndex(t => t.id === task.id);

        const taskCard = createEl("div", `task-card priority-${task.priority.toLowerCase()}`);

        if (task.isEditing) {
            const editForm = createEl("form", "task-edit-form");

            const editTitle = createEl("input", "edit-input-title", {
                type: "text",
                value: task.title,
                required: true,
                placeholder: "Task Title"
            });

            const editDesc = createEl("textarea", "edit-input-desc", {
                value: task.description || "",
                placeholder: "Task Description"
            });

            const editDate = createEl("input", "edit-input-date", {
                type: "date",
                value: task.dueDate || ""
            });

            const editPriority = createEl("select", "edit-input-priority");
            ["Low", "Medium", "High"].forEach((level) => {
                const option = createEl("option", null, {
                    value: level,
                    textContent: level,
                    selected: level === task.priority
                });
                editPriority.appendChild(option);
            });

            const saveBtn = createEl("button", "edit-save-btn", {
                type: "submit",
                textContent: "Save Changes"
            });

            editForm.appendChild(editTitle);
            editForm.appendChild(editDesc);
            editForm.appendChild(editDate);
            editForm.appendChild(editPriority);
            editForm.appendChild(saveBtn);
            taskCard.appendChild(editForm);

            editForm.addEventListener("submit", (e) => {
                e.preventDefault();
                task.title = editTitle.value;
                task.description = editDesc.value || null;
                task.dueDate = editDate.value || null;
                task.priority = editPriority.value;
                task.isEditing = false; 

                saveProjectsData();
                refreshUI();
            });

        } else {
            const cardHeader = createEl("div", "task-card-header");

            const taskTitle = createEl("h3", "task-title");
            taskTitle.textContent = task.title;
            cardHeader.appendChild(taskTitle);

            const cardActions = createEl("div", "task-card-actions");

            const editTaskBtn = createEl("button", "edit-task-btn");
            editTaskBtn.textContent = "Edit";
            editTaskBtn.addEventListener("click", () => {
                task.isEditing = true; 
                refreshUI();
            });

            const deleteTaskBtn = createEl("button", "delete-task-btn");
            deleteTaskBtn.textContent = "X";
            deleteTaskBtn.addEventListener("click", () => {
                project.tasks.splice(trueTaskIndex, 1);
                saveProjectsData();
                refreshUI();
            });

            cardActions.appendChild(editTaskBtn);
            cardActions.appendChild(deleteTaskBtn);
            cardHeader.appendChild(cardActions);
            taskCard.appendChild(cardHeader);

            if (task.description) {
                const taskDesc = createEl("p", "task-description");
                taskDesc.textContent = task.description;
                taskCard.appendChild(taskDesc);
            }

            if (task.dueDate){
                const dateBadge = createEl("div", "task-date-label");
                const parsedDate = new Date(task.dueDate.replace(/-/g, '\/'));
                dateBadge.textContent = `Due: ${format(parsedDate, 'MMM d, yyyy')}`;
                taskCard.appendChild(dateBadge);
            }

            const priorityLabel = createEl("div", "task-priority-label");
            priorityLabel.textContent = `Priority: ${task.priority}`;
            taskCard.appendChild(priorityLabel);
        }

        if (task.checklist) {
            const checklistContainer = createEl("div", "task-checklist-wrapper");
            const checklistTitle = createEl("h4", "checklist-title");
            checklistTitle.textContent = "Checklist";
            checklistContainer.appendChild(checklistTitle);

            const listElement = createEl("ul", "task-checklist");

            task.checklist.forEach((checkItem, checkIndex) => {
                const listItem = createEl("li", "checklist-item");
                const checkboxId = `check-${task.id}-${checkIndex}`;

                const checkbox = createEl("input", "checklist-box", {
                    type: "checkbox",
                    id: checkboxId,
                    checked: checkItem.isCompleted
                });

                const itemTextWrapper = createEl("div", "subtask-text-wrapper");
                
                const label = createEl("label", "checklist-text", {
                    htmlFor: checkboxId
                });
                label.textContent = checkItem.title;

                if (checkItem.isCompleted) {
                    label.classList.add("completed-text"); 
                }
                itemTextWrapper.appendChild(label);

                label.addEventListener("click", (e) => {
                    e.preventDefault(); 
                    
                    const inlineInput = createEl("input", "inline-subtask-edit-input", {
                        type: "text",
                        value: checkItem.title
                    });
                    
                    itemTextWrapper.replaceChild(inlineInput, label);
                    inlineInput.focus();

                    const commitSubtaskChange = () => {
                        if (inlineInput.value.trim()) {
                            checkItem.title = inlineInput.value.trim();
                            saveProjectsData();
                        }
                        refreshUI();
                    };

                    inlineInput.addEventListener("blur", commitSubtaskChange);
                    inlineInput.addEventListener("keydown", (evt) => {
                        if (evt.key === "Enter") commitSubtaskChange();
                    });
                });

                checkbox.addEventListener("change", (e) => {
                    checkItem.isCompleted = e.target.checked;
                    saveProjectsData();
                    if(e.target.checked){
                        label.classList.add("completed-text");
                    }
                    else{
                        label.classList.remove("completed-text");
                    }
                });

                listItem.appendChild(checkbox);
                listItem.appendChild(itemTextWrapper);
                listElement.appendChild(listItem);
            });

            checklistContainer.appendChild(listElement);

            const subForm = createEl("form", "add-checklist-form");

            const subInput = createEl("input", "add-checklist-input", {
                type: "text",
                placeholder: "Add subtask...",
                required: true,
                autocomplete: "off"
            });

            const subSubmitBtn = createEl("button", "add-checklist-btn", {
                type: "submit",
                textContent: "+"
            });

            subForm.appendChild(subInput);
            subForm.appendChild(subSubmitBtn);
            checklistContainer.appendChild(subForm);

            subForm.addEventListener("submit", (e) => {
                e.preventDefault();
                task.checklist.push({
                    title: subInput.value,
                    isCompleted: false
                });
                saveProjectsData();
                refreshUI();
            });

            taskCard.appendChild(checklistContainer);
        }

        taskContainer.appendChild(taskCard);
    });
}

export function refreshUI() {
    if (!currentActiveProject) {
        const list = getProjects();
        if (list.length > 0) currentActiveProject = list[0];
    }

    showSidebar();
    showProjectContent(currentActiveProject);
}

export function setupModalListeners() {
  const modal = document.getElementById("project-modal");
  const openBtn = document.getElementById("open-project-modal-btn");
  const closeBtn = document.getElementById("close-project-modal-btn");
  const form = document.getElementById("project-form");

  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputField = document.getElementById("new-project-title");
    const newProj = createProject(inputField.value);
    
    addProject(newProj);
    currentActiveProject = newProj;
    
    inputField.value = "";
    modal.classList.add("hidden");
    refreshUI();
  });
}