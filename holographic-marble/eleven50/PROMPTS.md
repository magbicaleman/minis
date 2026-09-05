# Image-generation record

Built-in image_gen mode. Original product photo: https://woodnwaters.com/cdn/shop/files/Green_Closed.png?v=1733368869&width=1946

Final project asset: assets/eleven50-green.png

## Selected generation

Use case: background-extraction
Asset type: transparent product cutout for an interactive luxury collectible card.
Primary request: Remove the pale background and floor from the supplied photograph of the green Eleven50 accessory. Preserve the exact existing product, seen straight-on, in the CLOSED position. Keep the long rounded rectangular green body, original green color and subtle coating texture, the silver circular knurled thumb wheel, its exact position low on the body, and the J-shaped recessed slider track at the right. No prongs should appear because this is the closed version. Do not redesign, add logos or text, change proportions, or substitute a different product.
Input image: edit target, exact product identity reference.
Composition/framing: upright, whole object, tight crop with about 6% empty padding around it, tall portrait output.
Lighting/mood: retain faithful studio lighting and clean precise edges, preserve metallic detail.
Constraints: genuinely transparent alpha background, no background color, no floor, no cast shadow, no extra objects, no lettering. Product pixels should remain as faithful as possible.

## Discarded refinement

Use case: background-extraction.
Edit the supplied image. Keep the green rectangular product and its silver thumb wheel exactly as they are. Remove absolutely EVERYTHING outside the solid physical outline of the product: remove the green aura, bloom, black backdrop, shadows, floor, and any stray pixels. The background must be 100% transparent alpha, all the way up to the product's clean edges. No new lighting, no glow, no vignette. Preserve the physical product, its green finish, J-shaped track, circular silver thumbwheel, and closed state unchanged. Keep the whole product centered upright with transparent padding. Return a true transparent PNG product cutout.

The refinements painted a checkerboard instead of producing usable transparency and were discarded. The selected first image is composited with a CSS silhouette mask to remove the surrounding halo. Original generated files remain in the default generated_images directory.
