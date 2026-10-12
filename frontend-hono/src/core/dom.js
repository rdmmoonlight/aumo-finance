/**
 * Helper untuk membuat elemen DOM (HyperScript ala Vanilla)
 * @param {string} tag
 * @param {Object} [props]
 * @param {...(Node|string)} children
 * @returns {HTMLElement}
 */
export function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);

    for (const [key, value] of Object.entries(props || {})) {
        if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, value);
        } else if (key === 'className' || key === 'class') {
            el.className = value;
        } else if (key === 'dataset') {
            Object.assign(el.dataset, value);
        } else if (value !== false && value != null) {
            el.setAttribute(key, value === true ? '' : value);
        }
    }

    children.flat(Infinity).forEach((child) => {
        if (child == null || child === false) return;
        if (typeof child === 'string' || typeof child === 'number') {
            el.appendChild(document.createTextNode(String(child)));
        } else if (child instanceof Node) {
            el.appendChild(child);
        }
    });

    return el;
}

/**
 * Menempelkan elemen ke container target (membersihkan isi sebelumnya jika diset)
 */
export function mount(parent, child, clear = true) {
    const target = typeof parent === 'string' ? document.querySelector(parent) : parent;
    if (!target) return;
    if (clear) target.innerHTML = '';
    if (child) target.appendChild(child);
}

/**
 * Event Listener dengan pengembalian fungsi pembersih (Disposer)
 */
export function on(target, event, handler, options) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return () => { };

    el.addEventListener(event, handler, options);
    return () => el.removeEventListener(event, handler, options);
}

/**
 * Manajer Disposer untuk menampung banyak cleanup function
 */
export function createDisposer() {
    const cleanupTasks = new Set();

    return {
        add(fn) {
            if (typeof fn === 'function') cleanupTasks.add(fn);
        },
        clean() {
            cleanupTasks.forEach((fn) => {
                try {
                    fn();
                } catch (e) {
                    console.error('Error during cleanup:', e);
                }
            });
            cleanupTasks.clear();
        },
    };
}

/**
 * Cek breakpoint mobile (sesuai tailwind md / 768px)
 */
export function isMobile(breakpoint = 768) {
    return window.innerWidth < breakpoint;
}