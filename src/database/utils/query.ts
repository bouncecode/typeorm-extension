/* istanbul ignore next */
import { SelectQueryBuilder } from "@bouncecode/typeorm";

export function existsQuery<T>(
    builder: SelectQueryBuilder<T>,
    inverse = false
) {
    return `${inverse ? "not " : ""}exists (${builder.getQuery()})`;
}
