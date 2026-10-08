import { useMemo } from "react";

export type SortOption = "newest" | "a-z" | "z-a";

export type UseSearchOptions<T> = {
	/**
	 * Case sensitive search (default: false)
	 */
	caseSensitive?: boolean;
	/**
	 * Ignore diacritics/accents (default: true)
	 */
	ignoreDiacritics?: boolean;
	/**
	 * Custom filter function (overrides default)
	 */
	filterFn?: (item: T, searchTerm: string) => boolean;
	/**
	 * Sort option: "newest" | "a-z" | "z-a"
	 */
	sortBy?: SortOption;
	/**
	 * Custom date getter for "newest" sorting (defaults to item.created_at)
	 */
	getSortDate?: (item: T) => string | Date | undefined;
};

function normalize(
	str: string,
	ignoreDiacritics: boolean,
	caseSensitive: boolean,
) {
	let s = str;
	if (ignoreDiacritics) {
		s = s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
	}
	if (!caseSensitive) {
		s = s.toLowerCase();
	}
	return s;
}

/**
 * Flexible, memoized search and sort hook for arrays.
 * @param items Array of items to search and sort
 * @param searchTerm The search string
 * @param getSearchableString Function to extract string from item
 * @param options Search & sort options
 */
export default function useSearch<T = unknown>(
	items: T[],
	searchTerm: string,
	getSearchableString: (item: T) => string,
	options?: UseSearchOptions<T>,
): { results: T[]; isSearching: boolean } {
	const {
		caseSensitive = false,
		ignoreDiacritics = true,
		filterFn,
		sortBy,
		getSortDate,
	} = options || {};

	const normalizedSearchTerm = useMemo(
		() => normalize(searchTerm || "", ignoreDiacritics, caseSensitive),
		[searchTerm, ignoreDiacritics, caseSensitive],
	);

	const results = useMemo(() => {
		let filtered = items;
		if (searchTerm) {
			if (filterFn) {
				filtered = items.filter((item) => filterFn(item, searchTerm));
			} else {
				filtered = items.filter((item) => {
					const value = normalize(
						getSearchableString(item),
						ignoreDiacritics,
						caseSensitive,
					);
					return value.includes(normalizedSearchTerm);
				});
			}
		}

		if (!sortBy) return filtered;

		const sorted = [...filtered];
		if (sortBy === "a-z") {
			sorted.sort((a, b) =>
				getSearchableString(a).localeCompare(getSearchableString(b), "id", {
					sensitivity: "base",
				}),
			);
		} else if (sortBy === "z-a") {
			sorted.sort((a, b) =>
				getSearchableString(b).localeCompare(getSearchableString(a), "id", {
					sensitivity: "base",
				}),
			);
		} else if (sortBy === "newest") {
			sorted.sort((a, b) => {
				const dateA = getSortDate
					? getSortDate(a)
					: ((a as Record<string, unknown>)?.created_at as
							| string
							| Date
							| undefined);
				const dateB = getSortDate
					? getSortDate(b)
					: ((b as Record<string, unknown>)?.created_at as
							| string
							| Date
							| undefined);
				if (dateA && dateB) {
					return new Date(dateB).getTime() - new Date(dateA).getTime();
				}
				return 0;
			});
		}

		return sorted;
	}, [
		items,
		searchTerm,
		getSearchableString,
		filterFn,
		ignoreDiacritics,
		caseSensitive,
		normalizedSearchTerm,
		sortBy,
		getSortDate,
	]);

	return {
		results,
		isSearching: !!searchTerm,
	};
}
