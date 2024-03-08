// Helpers
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid({
	title: 'Mollitia',
	cleanUrls: true,
	srcDir: './src',
	head: [
		['link', { rel: 'icon', href: '/favicon.svg'}],
	],
	themeConfig: {
		logo: '/favicon.svg',
		nav: [
			{
				text: 'Guide',
				link: '/guide/what-is-mollitia',
				activeMatch: '/guide/'
			},
			{
				text: 'Links',
				items: [
					{
						text: 'Contributing',
						link: 'https://github.com/genesys/mollitia/blob/main/CONTRIBUTING.md'
					},
					{
						text: 'Changelog',
						link: 'https://github.com/genesys/mollitia/blob/main/CHANGELOG.md'
					}
				]
			}
		],
		socialLinks: [
      { icon: 'github', link: 'https://github.com/genesys/mollitia' }
    ],
		sidebar: {
			'/guide/': [
				{
					text: 'Introduction',
					collapsed: false,
					items: [
						{ text: 'What is Mollitia?', link: '/guide/what-is-mollitia' },
						{ text: 'Design', link: '/guide/design' },
						{ text: 'Getting Started', link: '/guide/getting-started' }
					]
				},
				{
					text: 'API',
					collapsed: false,
					items: [
						{ text: 'Circuit', link: '/guide/api/circuit' },
						{
							text: 'Modules',
							collapsed: false,
							items: [
								{ text: 'Fallback', link: '/guide/api/modules/fallback' },
								{ text: 'Timeout', link: '/guide/api/modules/timeout' },
								{ text: 'Retry', link: '/guide/api/modules/retry' },
								{ text: 'Cache', link: '/guide/api/modules/cache' },
								{ text: 'Ratelimit', link: '/guide/api/modules/ratelimit' },
								{ text: 'Bulkhead', link: '/guide/api/modules/bulkhead' },
								{
									text: 'Circuit Breaker',
									collapsed: false,
									items: [
										{ text: 'Sliding Count', link: '/guide/api/modules/breaker/sliding-count' },
										{ text: 'Sliding Time', link: '/guide/api/modules/breaker/sliding-time' }
									]
								}
							]
						}
					]
				},
				{
					text: 'Customization',
					collapsed: false,
					items: [
						{
							text: 'Modules',
							link: '/guide/customization/modules'
						},
						{
							text: 'Addons',
							link: '/guide/customization/addons',
							collapsed: false,
							items: [
                { text: 'Prometheus', link: '/guide/customization/addons/prometheus' },
                { text: 'Redis Storage', link: '/guide/customization/addons/redisStorage' }
							]
						}
					]
				}
			]
		},
		search: {
			provider: 'local'
		}
	}
});
