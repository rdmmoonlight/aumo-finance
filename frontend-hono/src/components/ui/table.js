export function Table({ className = '', children = '' }) {
  return `<div class="relative w-full overflow-auto"><table class="w-full caption-bottom text-sm ${className}">${children}</table></div>`;
}

export function TableHeader({ className = '', children = '' }) {
  return `<thead class="[&_tr]:border-b ${className}">${children}</thead>`;
}

export function TableBody({ className = '', children = '' }) {
  return `<tbody class="[&_tr:last-child]:border-0 ${className}">${children}</tbody>`;
}

export function TableRow({ className = '', children = '' }) {
  return `<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}">${children}</tr>`;
}

export function TableHead({ className = '', children = '' }) {
  return `<th class="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${className}">${children}</th>`;
}

export function TableCell({ className = '', children = '' }) {
  return `<td class="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${className}">${children}</td>`;
}
