let count = 0;

/** An id unique within the document, for SVG definitions referenced by url(). */
export function uid(prefix: string): string {
	count += 1;
	return `${prefix}-${count}`;
}
