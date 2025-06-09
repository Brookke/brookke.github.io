// Utility to generate Jekyll-style URLs for posts
// Format: /blog/:categories/:title

export function generateJekyllSlug(
  title: string,
  categories: string[] | string = [],
): string {
  // Convert title to slug
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters except hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();

  // Handle categories - if it's a string, convert to array
  const categoryArray = Array.isArray(categories) ? categories : [categories];

  // Convert categories to lowercase and join with hyphens if multiple
  const categorySlug = categoryArray
    .filter((cat) => cat) // Remove empty categories
    .map((cat) => cat.toLowerCase())
    .join("-");

  // Generate the Jekyll-style URL: /blog/category/title
  return categorySlug ? `${categorySlug}/${titleSlug}` : titleSlug;
}

export function getJekyllUrl(
  title: string,
  categories: string[] | string = [],
): string {
  const slug = generateJekyllSlug(title, categories);
  return `/blog/${slug}`;
}
