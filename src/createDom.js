export function createElement(tag, className, options = {}) {
    const el = document.createElement(tag);
    if(className) el.className = className;
    Object.assign(el, options);
    return el;
}