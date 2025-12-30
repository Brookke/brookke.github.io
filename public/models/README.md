# STL Models Directory

Place your STL files here to use them in blog posts.

## File Organization

Organize files by project or category:

- `hooks/` - Hook designs
- `bike/` - Bike-related parts
- `storage/` - Storage solutions
- etc.

## Usage in Blog Posts

Reference models in your MDX files:

```mdx
import STLViewer from "../../components/STLViewer.astro";

<STLViewer modelPath="/models/your-file.stl" />
```

## Optimization Tips

- Use binary STL format (smaller file size)
- Keep models under 5MB when possible for faster loading
- Consider decimating high-poly models for web use
- Test loading times in development
