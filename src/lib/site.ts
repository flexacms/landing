/** App name shown in the logo, footer and SEO tags. */
export const APP_NAME: string = import.meta.env.PUBLIC_APP_NAME || 'Flexa';

/**
 * Origin of the Flexa app (dashboard, login, register). Empty keeps links
 * relative, which works when the landing is served from the same host.
 */
export const APP_URL: string = (import.meta.env.PUBLIC_APP_URL || '').replace(
    /\/$/,
    '',
);

/** Public URL of this landing, used for canonical and Open Graph tags. */
export const SITE_URL: string = import.meta.env.SITE || 'https://flexacms.com';

export const IS_AUTH_ENABLED: boolean =
    import.meta.env.PUBLIC_AUTH_ENABLED !== 'false';

export const appUrl = (path: string): string => `${APP_URL}${path}`;

export const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Integrations', href: '#integrations' },
    { label: 'MCP', href: '#mcp' },
    { label: 'FAQ', href: '#faq' },
];

/**
 * Brand logos from thesvg.org. Single-colour logos are drawn as CSS masks so
 * they follow the surrounding text colour (or a brand colour) in both themes.
 */
export type BrandIcon = {
    src: string;
    mask?: boolean;
    color?: string;
    wide?: boolean;
};

export const BRAND_ICONS = {
    javascript: { src: 'javascript-default.svg' },
    react: { src: 'react-default.svg' },
    reactMono: { src: 'react-mono.svg', mask: true },
    next: { src: 'nextdotjs-mono.svg', mask: true },
    nuxt: { src: 'nuxt-default.svg' },
    nuxtMono: { src: 'nuxt-mono.svg', mask: true },
    astro: { src: 'astro-mono.svg', mask: true },
    svelte: { src: 'svelte-default.svg' },
    svelteMono: { src: 'svelte-mono.svg', mask: true },
    php: { src: 'php-default.svg', mask: true, color: '#777BB4', wide: true },
    laravel: { src: 'laravel-default.svg' },
    laravelMono: { src: 'laravel-mono.svg', mask: true },
    wordpress: { src: 'wordpress-default.svg' },
    wordpressMono: { src: 'wordpress-mono.svg', mask: true },
    joomla: { src: 'joomla-default.svg' },
    joomlaMono: { src: 'joomla-mono.svg', mask: true },
    typescript: { src: 'typescript-default.svg' },
    yootheme: { src: 'yootheme-mono.svg', mask: true, wide: true },
    claude: { src: 'claude-default.svg' },
    cursor: { src: 'cursor-light.svg', mask: true },
    vscode: { src: 'visual-studio-code-default.svg' },
    opencode: { src: 'opencode-mono.svg', mask: true },
} satisfies Record<string, BrandIcon>;

export const STACK = [
    { name: 'Next.js', icon: BRAND_ICONS.next },
    { name: 'Nuxt', icon: BRAND_ICONS.nuxtMono },
    { name: 'Astro', icon: BRAND_ICONS.astro },
    { name: 'SvelteKit', icon: BRAND_ICONS.svelteMono },
    { name: 'React', icon: BRAND_ICONS.reactMono },
    { name: 'Laravel', icon: BRAND_ICONS.laravelMono },
    { name: 'WordPress', icon: BRAND_ICONS.wordpressMono },
    { name: 'Joomla', icon: BRAND_ICONS.joomlaMono },
];

export const CODE_SAMPLES = [
    {
        label: 'Next.js',
        file: 'app/blog/[slug]/page.tsx',
        code: `import { createFlexaClient } from '@flexacms/next';

const flexa = createFlexaClient({ revalidate: 300 });

export default async function Post({ params }) {
  const { slug } = await params;
  const post = await flexa.entity('posts').find(slug);

  return <h1>{post.title}</h1>;
}`,
    },
    {
        label: 'Laravel',
        file: 'app/Http/Controllers/BlogController.php',
        code: `use FlexaCms\\Laravel\\Facades\\Flexa;

$posts = Flexa::entity('posts')
    ->published()
    ->paginate(12);

$post = Flexa::entity('posts')->findOrFail($slug);

$post->value('headline'); // resolves the app locale`,
    },
    {
        label: 'cURL',
        file: 'terminal',
        code: `curl https://flexacms.com/api/v1/posts?status=published \\
  -H "Authorization: Bearer flx_..."

{
  "data": [{
    "id": 42,
    "title": "Introducing our headless CMS",
    "status": "published",
    "values": {
      "excerpt": { "en": "Ship content anywhere", "es": "Publica en cualquier lugar" },
      "reading_time": 4
    }
  }],
  "meta": { "current_page": 1, "total": 128 }
}`,
    },
    {
        label: 'MCP',
        file: 'terminal',
        code: `claude mcp add --transport http flexa \\
  https://flexacms.com/mcp \\
  --header "Authorization: Bearer flx_..."

> Translate the last three posts to Spanish
  and publish them.`,
    },
];

export const STEPS = [
    {
        title: 'Start from a template',
        description:
            'Pick a blog, product catalog, marketing site or a blank project. Sample content types and entries are ready to edit.',
    },
    {
        title: 'Write your content',
        description:
            'Define your fields in the visual editor, invite your team, and write yourself or let the AI assistant draft it.',
    },
    {
        title: 'Publish it anywhere',
        description:
            'Create an API key and fetch content from your website or app, or connect an AI tool to manage it for you.',
    },
];

export const USE_CASES = [
    {
        title: 'Company website',
        description:
            'Marketing updates pages, banners and campaigns from the editor. Content changes go live without a code change or redeploy.',
        example: {
            heading: 'Entry · Spring campaign',
            status: 'Published',
            rows: [
                { label: 'headline', value: 'Ship faster this spring' },
                { label: 'hero_image', value: 'media/spring.jpg' },
                { label: 'cta_url', value: '/pricing' },
            ],
        },
    },
    {
        title: 'Multilingual blog',
        description:
            'Write in English, let the AI assistant draft the translations, and serve every language from the same API.',
        example: {
            heading: 'Entry · Our new pricing',
            status: 'EN · ES',
            rows: [
                { label: 'title.en', value: 'Our new pricing' },
                { label: 'title.es', value: 'Nuestros nuevos precios' },
                { label: 'reading_time', value: '4 min' },
            ],
        },
    },
    {
        title: 'Online store catalog',
        description:
            'Model products with prices, colors, variants and categories. Your storefront reads them with one request.',
        example: {
            heading: 'Product · Linen shirt',
            status: 'In stock',
            rows: [
                { label: 'price', value: '39.00' },
                { label: 'color', value: '#E8DCC4' },
                { label: 'variants', value: 'S · M · L' },
                { label: 'category', value: 'Clothing' },
            ],
        },
    },
    {
        title: 'Agency with several clients',
        description:
            'One isolated workspace per client, each with its own content models, entries and API keys. Invite clients as viewers to review drafts.',
        example: {
            heading: 'Workspaces',
            status: '3 active',
            rows: [
                { label: 'Acme Corp', value: '3 editors · 1 viewer' },
                { label: 'Bakery Lola', value: '1 editor' },
                { label: 'Studio Nord', value: '2 editors · 1 viewer' },
            ],
        },
    },
];

export const INTEGRATIONS: { name: string; detail: string; icon: BrandIcon }[] =
    [
        {
            name: 'JavaScript',
            detail: 'npm i @flexacms/client',
            icon: BRAND_ICONS.javascript,
        },
        {
            name: 'React',
            detail: 'npm i @flexacms/react',
            icon: BRAND_ICONS.react,
        },
        {
            name: 'Next.js',
            detail: 'npm i @flexacms/next',
            icon: BRAND_ICONS.next,
        },
        {
            name: 'Nuxt',
            detail: 'npm i @flexacms/nuxt',
            icon: BRAND_ICONS.nuxt,
        },
        {
            name: 'Astro',
            detail: 'npm i @flexacms/astro',
            icon: BRAND_ICONS.astro,
        },
        {
            name: 'SvelteKit',
            detail: 'npm i @flexacms/sveltekit',
            icon: BRAND_ICONS.svelte,
        },
        {
            name: 'PHP',
            detail: 'composer require flexacms/php',
            icon: BRAND_ICONS.php,
        },
        {
            name: 'Laravel',
            detail: 'composer require flexacms/laravel',
            icon: BRAND_ICONS.laravel,
        },
        {
            name: 'WordPress',
            detail: 'Blocks, shortcodes · WP 6.5+',
            icon: BRAND_ICONS.wordpress,
        },
        {
            name: 'Joomla',
            detail: 'Menu items, module · Joomla 5',
            icon: BRAND_ICONS.joomla,
        },
        {
            name: 'YOOtheme Pro',
            detail: 'Dynamic builder sources',
            icon: BRAND_ICONS.yootheme,
        },
        {
            name: 'TypeScript',
            detail: 'npx @flexacms/cli generate',
            icon: BRAND_ICONS.typescript,
        },
    ];

export const MCP_ABILITIES = [
    {
        ability: 'Read',
        tools: 'See your content types, search entries and browse their history',
    },
    {
        ability: 'Write',
        tools: 'Create and edit entries, then publish or unpublish them',
    },
    {
        ability: 'Structure',
        tools: 'Add or change content types, fields and categories',
    },
    { ability: 'Delete', tools: 'Remove entries, fields or whole content types' },
];

export const MCP_CLIENTS = [
    { name: 'Claude', icon: BRAND_ICONS.claude },
    { name: 'Cursor', icon: BRAND_ICONS.cursor },
    { name: 'VS Code', icon: BRAND_ICONS.vscode },
    { name: 'OpenCode', icon: BRAND_ICONS.opencode },
];

export const FAQS = [
    {
        question: 'What is a headless CMS?',
        answer: 'A content management system that stores and edits your content but does not render your website. Flexa gives you an editor for your content and an API to read it, so you can use any frontend: Next.js, Nuxt, Astro, a mobile app or an AI tool.',
    },
    {
        question: 'Do I need to write migrations to add content types?',
        answer: 'No. Models and fields are defined in the visual builder (or by an AI client with the Schema ability) and are available in the API immediately.',
    },
    {
        question: 'Can I use it with my existing WordPress or Joomla site?',
        answer: 'Yes. The WordPress plugin adds blocks, shortcodes and template functions; the Joomla package adds menu items with SEF URLs, a module and article tags; and the YOOtheme Pro plugin exposes your models as dynamic content sources.',
    },
    {
        question: 'Is it safe to let an AI client manage my content?',
        answer: 'Every MCP connection uses an API key, so it can only do what that key allows — per ability, per model and until it expires. Every change is recorded in the revision history and can be restored.',
    },
    {
        question: 'How do translations work?',
        answer: 'Mark any field as translatable and the API returns a value per locale. The SDKs include a localize helper with fallbacks, and the assistant can translate entries for you.',
    },
    {
        question: 'Can I keep separate projects apart?',
        answer: 'Each workspace has its own models, entries, media, members and API keys. Nothing is shared between workspaces.',
    },
];

export const FIELD_TYPES = [
    'Text',
    'Rich text',
    'Media',
    'Relationship',
    'Repeater',
    'Select',
    'Date',
    'Color',
    'Number',
    'Toggle',
];

/**
 * Staggers revealed siblings by giving each one a growing transition delay.
 */
export function revealDelay(index: number, step = 80): string {
    return `--reveal-delay: ${index * step}ms`;
}

/**
 * Delays a hero entrance animation so the above-the-fold content cascades in.
 */
export function riseDelay(milliseconds: number): string {
    return `animation-delay: ${milliseconds}ms`;
}
