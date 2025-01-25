import type { Menu, MenuItem } from "$types";
import {LinkSolid} from "flowbite-svelte-icons";

// //FIXME I want 
// const getMenuItems: (locale: string) => Menu[] = (locale: string) => [
//     {
//         title: _("Ressources"),
//         items: <MenuItem[]>[
//             {
//                 title: _("Vidéos et images"),
//                 link: getMediaLibraryRegisterLink(locale),
//                 icon: LinkSolid,
//             },
//             {
//                 title: _("Communiqués et dossiers de presse"),
//                 link: Web.pressrelease,
//             },
//             {
//                 title: _("Parutions presse"),
//                 link: Web.coverage,
//             },
//             {
//                 title: _("Thématiques et textes médias"),
//                 link: Web.themes,
//             },
//         ]
//     },
//     {
//         title: _("Nouveautés et incontournables"),
//         items: <MenuItem[]>[
//             {
//                 title: _("Nouveautés"),
//                 link: Web.highlights,
//                 anchor: "#news",
//             },
//             {
//                 title: _("Incontournables"),
//                 link: Web.highlights,
//                 anchor: "#highlights",
//             }
//         ]
//     },
//     {
//         title: _("Chiffres"),
//         link: Web.home,
//         anchor: "#numbers"
//     },
//     {
//         title: _("Distinctions"),
//         link: Web.home,
//         anchor: "#distinctions",
//     },
//     {
//         title: _("FAQ"),
//         link: Web.home,
//         anchor: "#faq",
//     }
//   ];