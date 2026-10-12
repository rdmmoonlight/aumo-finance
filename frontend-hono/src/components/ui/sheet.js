export function createSheet({ id, side = 'right', title, content }) {
  const sideClasses = {
    right: 'ml-auto h-full max-h-screen w-80 inset-y-0 right-0 rounded-l-xl',
    left: 'mr-auto h-full max-h-screen w-80 inset-y-0 left-0 rounded-r-xl',
    bottom: 'mt-auto w-full max-w-none inset-x-0 bottom-0 rounded-t-xl',
  };
  return `<dialog id="${id}" class="m-0 p-6 backdrop:bg-black/50 border shadow-xl ${sideClasses[side] || sideClasses.right}">
    <div class="flex justify-between items-center pb-4 border-b">
      <h3 class="text-lg font-semibold">${title}</h3>
      <button onclick="document.getElementById('${id}').close()" class="p-1 rounded-md hover:bg-accent">✕</button>
    </div>
    <div class="pt-4">${content}</div>
  </dialog>`;
}
