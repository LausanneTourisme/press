import { Themes } from "$enums";
import type { Transform } from "$lib/cloudinary";

export type ThemeDetail = {
    [key in keyof typeof Themes]: {
        image: string,
        head: string,
        background: string,
        backgroundHover: string,
        card: string,
        transform?: Transform
    }
};

export const ThemeDetails: ThemeDetail = {
    Architecture: {
        image: '/images/pages/themes/architecture-tour-galfetti.jpg',
        head: "/images/pages/themes/heads/musique.png",
        background: "bg-violet-300",
        backgroundHover: "bg-violet-300/50",
        card: "bg-violet-300/90",
    },
    Culture: {
        image: '/images/pages/themes/plateforme_10.jpg',
        head: "/images/pages/themes/heads/mme_bonnet.png",
        background: "bg-amber-300",
        backgroundHover: "bg-amber-300/50",
        card: "bg-amber-300/90",
    },
    Education: {
        image: '/images/pages/themes/rolex-learning-center.jpg',
        head: "/images/pages/themes/heads/chignon.png",
        background: "bg-indigo-300",
        backgroundHover: "bg-indigo-300/50",
        card: "bg-indigo-300/90",
    },
    Family: {
        image: '/images/pages/themes/famille-musee-olympique.jpg',
        head: "/images/pages/themes/heads/lunettessoleil.png",
        background: "bg-teal-300",
        backgroundHover: "bg-teal-300/50",
        card: "bg-teal-300/90",
    },
    Gastronomy: {
        image: '/images/pages/themes/gastronomie_2.jpg',
        head: "/images/pages/themes/heads/mr_bonnet.png",
        background: "bg-red-300",
        backgroundHover: "bg-red-300/50",
        card: "bg-red-300/90",
    },
    Lacustrine: {
        image: '/images/pages/themes/lacustre-jetee-compagnie.jpg',
        head: "/images/pages/themes/heads/punk.png",
        background: "bg-blue-300",
        backgroundHover: "bg-blue-300/50",
        card: "bg-blue-300/90",
    },
    Nature: {
        image: '/images/pages/themes/hermitage.jpg',
        head: "/images/pages/themes/heads/fleur.png",
        background: "bg-apple-300",
        backgroundHover: "bg-apple-300/50",
        card: "bg-apple-300/90",
        transform: {gravity: "north", crop: 'auto'},
    },
    Sport: {
        image: '/images/pages/themes/cathedrale_skate.jpg',
        head: "/images/pages/themes/heads/hockey.png",
        background: "bg-sky-300",
        backgroundHover: "bg-sky-300/50",
        card: "bg-sky-300/90",
    },
    Sustainability: {
        image: '/images/pages/themes/vendanges.jpg',
        head: "/images/pages/themes/heads/garcon.png",
        background: "bg-fuchsia-300",
        backgroundHover: "bg-fuchsia-300/50",
        card: "bg-fuchsia-300/90",
    },
    Unusual: {
        image: '/images/pages/themes/insolite-pavillon.jpg',
        head: "/images/pages/themes/heads/confettis.png",
        background: "bg-pink-300",
        backgroundHover: "bg-pink-300/50",
        card: "bg-pink-300/90",
        transform: {g: 'auto', c: 'fill'}
    },
    Wellness: {
        image: '/images/pages/themes/bienetre-brp.jpg',
        head: "/images/pages/themes/heads/mamie.png",
        background: "bg-lime-300",
        backgroundHover: "bg-lime-300/50",
        card: "bg-lime-300/90",
    },
}

