import { RNG } from "near-sdk-as";

/**
 * Generate a uniqueId with the provided prefix
 * @export
 * @param {string} prefix - The prefix to append the unique identifier
 * @param {string[]} ids - The list of existing Ids
 * @returns {string} - The new unique Id
 */
export function generateUniqueId(prefix: string, ids: string[]): string {
    const roll = new RNG<u32>(1, u32.MAX_VALUE);
    const id =  `${prefix}-${roll.next().toString()}`;
    if (ids.includes(id)) {
        return generateUniqueId(prefix, ids);
    }
    return id;
}