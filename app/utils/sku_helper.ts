import Product from '#models/product'

function toSkuCode(name: string, maxLength: number = 10): string {
    return name
        .toUpperCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, maxLength)
}

export function generateBaseSku(
    categoryName: string,
    productId: number,
    productName?: string
): string {
    const categoryCode = toSkuCode(categoryName, 6)
    const productCode = productName ? toSkuCode(productName, 6) : 'PROD'
    return `${categoryCode}-${productCode}-${productId}`
}

export function generateVariantSku(
    productSku: string,
    optionValues: Array<{ optionName: string; valueName: string }>
): string {
    const valueCodes = optionValues.map((ov) => {
        const code = ov.valueName
            .toUpperCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .split('-')
            .filter((w) => w.length > 0)
            .map((w) => w.substring(0, 4))
            .join('-')
            .substring(0, 8)
        return code
    })

    return `${productSku}-${valueCodes.join('-')}`
}

export async function ensureUniqueSku(sku: string, excludeProductId?: number): Promise<string> {
    let uniqueSku = sku
    let counter = 1

    while (true) {
        const query = Product.query().where('sku', uniqueSku)
        if (excludeProductId) {
            query.whereNot('id', excludeProductId)
        }
        const exists = await query.first()

        if (!exists) {
            return uniqueSku
        }

        const baseSku = sku.length > 20 ? sku.substring(0, 20) : sku
        uniqueSku = `${baseSku}-${counter}`
        counter++

        if (counter > 999) {
            throw new Error('Unable to generate unique SKU after 999 attempts')
        }
    }
}
