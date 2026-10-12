/** Gabung nama kelas CSS; nilai falsy dibuang. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
