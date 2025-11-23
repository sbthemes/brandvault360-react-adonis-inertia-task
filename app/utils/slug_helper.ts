export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export async function generateUniqueSlug(
    baseSlug: string,
    checkUnique: (slug: string, excludeId?: number) => Promise<boolean>,
    existingId?: number
): Promise<string> {
    let slug = baseSlug
    let counter = 1

    while (true) {
        const exists = await checkUnique(slug, existingId)
        if (!exists) {
            return slug
        }

        slug = `${baseSlug}-${counter}`
        counter++
    }
}
