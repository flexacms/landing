import type { SVGAttributes } from "react";

/**
 * The Flexa glyph: an "F" assembled from content blocks. It is drawn with
 * `currentColor` so it can sit on the brand gradient or on plain text.
 */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="9 8 14 16" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="8" width="5" height="16" rx="2.5" />
            <rect x="16" y="8" width="7" height="5" rx="2.5" />
            <rect x="16" y="15" width="5" height="5" rx="2.5" opacity=".7" />
        </svg>
    );
}
