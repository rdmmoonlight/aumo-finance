export function Popover({ triggerId, popoverId, triggerLabel, content }) {
  return `<button popovertarget="${popoverId}" id="${triggerId}" class="px-4 py-2 text-sm border rounded-md hover:bg-accent">${triggerLabel}</button>
  <div id="${popoverId}" popover class="p-4 rounded-md border bg-popover shadow-md">${content}</div>`;
}
