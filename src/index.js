import "./style.css";
import { createEl } from "./createDom.js";
import { getProjects } from "./projects.js";
import { createTask } from "./tasks.js";
import { refreshUI, setupModalListeners, showSidebar, showProjectContent } from "./ui.js";

setupModalListeners();
refreshUI();