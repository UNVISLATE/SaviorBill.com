export const PAGE_1_SIZE = 16; // 1 featured + 15 compact (5 full rows of 3)
export const PAGE_N_SIZE = 18; // 6 full rows of 3

export function getTotalReleasePages(totalCount: number): number {
  if (totalCount <= PAGE_1_SIZE) return 1;
  return 1 + Math.ceil((totalCount - PAGE_1_SIZE) / PAGE_N_SIZE);
}

export function getReleasePageSlice<T>(items: T[], page: number): {
  featured: T | null;
  gridItems: T[];
  totalPages: number;
  currentPage: number;
} {
  const totalPages = getTotalReleasePages(items.length);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  if (currentPage === 1) {
    const pageItems = items.slice(0, PAGE_1_SIZE);
    return {
      featured: pageItems[0] || null,
      gridItems: pageItems.slice(1),
      totalPages,
      currentPage,
    };
  }

  const start = PAGE_1_SIZE + (currentPage - 2) * PAGE_N_SIZE;
  const end = start + PAGE_N_SIZE;
  return {
    featured: null,
    gridItems: items.slice(start, end),
    totalPages,
    currentPage,
  };
}
