import { Themes } from "$enums";
import type { Transform } from "$lib/cloudinary";

export type ThemeDetail = {
    [key in keyof typeof Themes]: {
        image: string,
        head: string,
        color: string,
        background: string,
        card: string,
        transform?: Transform
    }
};

export const ThemeDetails: ThemeDetail = {
    Architecture: {
        image: '/images/pages/themes/architecture-tour-galfetti.jpg',
        head: "/images/pages/themes/heads/musique.png",
        color: "bg-violet-300",
        background: "bg-violet-300/50",
        card: "bg-violet-300/90",
    },
    Culture: {
        image: '/images/pages/themes/plateforme_10.jpg',
        head: "/images/pages/themes/heads/mme_bonnet.png",
        color: "bg-amber-300",
        background: "bg-amber-300/50",
        card: "bg-amber-300/90",
    },
    Education: {
        image: '/images/pages/themes/rolex-learning-center.jpg',
        head: "/images/pages/themes/heads/chignon.png",
        color: "bg-indigo-300",
        background: "bg-indigo-300/50",
        card: "bg-indigo-300/90",
    },
    Family: {
        image: '/images/pages/themes/famille-musee-olympique.jpg',
        head: "/images/pages/themes/heads/lunettessoleil.png",
        color: "bg-teal-300",
        background: "bg-teal-300/50",
        card: "bg-teal-300/90",
    },
    Gastronomy: {
        image: '/images/pages/themes/gastronomie_2.jpg',
        head: "/images/pages/themes/heads/mr_bonnet.png",
        color: "bg-red-300",
        background: "bg-red-300/50",
        card: "bg-red-300/90",
    },
    Lacustrine: {
        image: '/images/pages/themes/lacustre-jetee-compagnie.jpg',
        head: "/images/pages/themes/heads/punk.png",
        color: "bg-blue-300",
        background: "bg-blue-300/50",
        card: "bg-blue-300/90",
    },
    Nature: {
        image: '/images/pages/themes/hermitage.jpg',
        head: "/images/pages/themes/heads/fleur.png",
        color: "bg-apple-300",
        background: "bg-apple-300/50",
        card: "bg-apple-300/90",
        transform: {gravity: "north", crop: 'auto'},
    },
    Sport: {
        image: '/images/pages/themes/cathedrale_skate.jpg',
        head: "/images/pages/themes/heads/hockey.png",
        color: "bg-sky-300",
        background: "bg-sky-300/50",
        card: "bg-sky-300/90",
    },
    Sustainability: {
        image: '/images/pages/themes/vendanges.jpg',
        head: "/images/pages/themes/heads/garcon.png",
        color: "bg-fuchsia-300",
        background: "bg-fuchsia-300/50",
        card: "bg-fuchsia-300/90",
    },
    Unusual: {
        image: '/images/pages/themes/insolite-pavillon.jpg',
        head: "/images/pages/themes/heads/confettis.png",
        color: "bg-pink-300",
        background: "bg-pink-300/50",
        card: "bg-pink-300/90",
        transform: {g: 'auto', c: 'fill'}
    },
    Wellness: {
        image: '/images/pages/themes/bienetre-brp.jpg',
        head: "/images/pages/themes/heads/mamie.png",
        color: "bg-lime-300",
        background: "bg-lime-300/50",
        card: "bg-lime-300/90",
    },
}

