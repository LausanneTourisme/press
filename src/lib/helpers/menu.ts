import { RouteTypes } from "$enums";
import { t, type Locale } from "$lib/translations";
import type { Menu, MenuItem } from "$types";
import { Link } from "lucide-svelte";

import { getMediaLibraryRegisterLink } from ".";

// FIXME it's not an helper but currently i don't know where i've to place it...
export const menuItems: (locale: Locale) => Menu[] = (locale) =>[
    {
        title: t.get('menu.ressources'),
        items: <MenuItem[]>[
            {
                title: t.get('menu.ressources.medialibrary'),
                link: getMediaLibraryRegisterLink(locale),
                icon: Link,
            },
            {
                title:t.get('menu.ressources.pressrelease'),
                link: `/${locale}/${t.get(`route.type.${RouteTypes.Pressrelease}.slug`)}`,
            },
            {
                title:t.get('menu.ressources.coverage'),
                link: `/${locale}/${t.get(`route.type.${RouteTypes.Coverage}.slug`)}`,
            },
            {
                title: t.get('menu.ressources.themes'),
                link: `/${locale}/${t.get(`route.type.${RouteTypes.Themes}.slug`)}`,
            },
        ]
    },
    {
        title: t.get('menu.news'),
        items: <MenuItem[]>[
            {
                title:t.get('menu.news.news'),
                link: `/${locale}/${t.get(`route.type.${RouteTypes.Highlights}.slug`)}#news`,
            },
            {
                title:t.get('menu.news.unmissable'),
                link: `/${locale}/${t.get(`route.type.${RouteTypes.Highlights}.slug`)}#highlights`,
            }
        ]
    },
    {
        title:t.get('menu.numbers'),
        link: `/${locale}/${t.get(`route.type.${RouteTypes.Home}.slug`)}#numbers`,
    },
    {
        title: t.get('menu.distinctions'),
        link: `/${locale}/${t.get(`route.type.${RouteTypes.Home}.slug`)}#distinctions`,
    },
    {
        title:t.get('menu.faq'),
        link: `/${locale}/${t.get(`route.type.${RouteTypes.Home}.slug`)}#faq`,
    }
  ];