import crypto from "node:crypto"

export function verifySignature(
    signature: string | undefined,
    rawBody: Buffer,
): boolean {
    if (!signature) {
        return false
    }

    const expectedSignature = "sha256=" +
        crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET!)
            .update(rawBody)
            .digest("hex")


    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    )
}