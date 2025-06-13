import { RouteTypes } from "$enums";
import { t, type Locale } from "$lib/translations";
import type { Menu, MenuItem } from "$types";
import { Link } from "lucide-svelte";

import { getMediaLibraryRegisterLink, route } from ".";

// FIXME it's not an helper but currently i don't know where i've to place it...
export const menuItems: (locale: Locale) => Menu[] = (locale) =>[
    {
        title: t.get('menu.ressources'),
        items: <MenuItem[]>[
            {
                title: t.get('menu.ressources.medialibrary'),
                link: getMediaLibraryRegisterLink(locale),
                icon: Link,
                strokeWidth: 2,
            },
            {
                title:t.get('menu.ressources.press-realeases-and-press-kits'),
                link: route(RouteTypes.PressreleasesAndPresskits),
            },
            {
                title:t.get('menu.ressources.coverage'),
                link: route(RouteTypes.Coverage),
            },
            {
                title: t.get('menu.ressources.themes'),
                link: route(RouteTypes.Themes),
            },
        ]
    },
    {
        title: t.get('menu.news'),
        items: <MenuItem[]>[
            {
                title:t.get('menu.news.news'),
                link: `${route(RouteTypes.Highlights)}#news`,
            },
            {
                title:t.get('menu.news.unmissable'),
                link: `${route(RouteTypes.Highlights)}#highlights`,
            }
        ]
    },
    {
        title:t.get('menu.numbers'),
        link: `${route(RouteTypes.Home)}#numbers`,
    },
    {
        title: t.get('menu.distinctions'),
        link: `${route(RouteTypes.Home)}#distinctions`,
    },
    {
        title:t.get('menu.faq'),
        link: `${route(RouteTypes.Home)}#faq`,
    }
  ];