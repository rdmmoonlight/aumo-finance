export function initTabs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const triggers = container.querySelectorAll('[role="tab"]');
  const panels = container.querySelectorAll('[role="tabpanel"]');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const target = trigger.getAttribute('aria-controls');
      triggers.forEach(t => { t.setAttribute('aria-selected', 'false'); t.classList.remove('bg-background', 'shadow-sm'); });
      panels.forEach(p => p.classList.add('hidden'));
      trigger.setAttribute('aria-selected', 'true');
      trigger.classList.add('bg-background', 'shadow-sm');
      container.querySelector(`#${target}`)?.classList.remove('hidden');
    });
  });
}
export function Tabs({ containerId, tabs = [] }) {
  const triggersHtml = tabs.map((tab, idx) => `<button role="tab" aria-selected="${idx === 0 ? 'true' : 'false'}" aria-controls="panel-${tab.id}" class="px-3 py-1.5 text-sm font-medium rounded-md transition-all ${idx === 0 ? 'bg-background shadow-sm' : ''}">${tab.label}</button>`).join('');
  const panelsHtml = tabs.map((tab, idx) => `<div id="panel-${tab.id}" role="tabpanel" class="${idx !== 0 ? 'hidden' : ''} pt-4">${tab.content}</div>`).join('');
  return `<div id="${containerId}"><div role="tablist" class="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">${triggersHtml}</div>${panelsHtml}</div>`;
}
