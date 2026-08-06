/* export */ function createTask({
    title,
    description = "",
    dueDate = null,
    priority = "medium",
    notes = "",
    checklist = []
}) {

    return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        title,
        description,
        dueDate,
        priority,
        notes,
        checklist: checklist.map(item => ({
            title: item.title,
            isCompleted: item.isCompleted || false
        })),
        isComplete: false
    };
}