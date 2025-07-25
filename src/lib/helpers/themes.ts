import { Themes, type Theme } from "$enums";
import type { Transform } from "$types";

export type ThemeDetail = {
  [key in keyof typeof Themes]: {
    image: string,
    head: string,
    borderColor: string,
    color: string,
    background: string,
    card: string,
    transform?: Transform
  }
};

export const ThemeDetails: ThemeDetail = {
  Architecture: {
    image: '/pages/themes/architecture-tour-galfetti.jpg',
    head: "/pages/themes/heads/musique.png",
    color: "bg-violet-300",
    borderColor: "border-violet-300",
    background: "bg-violet-300/50",
    card: "bg-violet-300/90",
  },
  Culture: {
    image: '/pages/themes/plateforme_10.jpg',
    head: "/pages/themes/heads/mme_bonnet.png",
    color: "bg-amber-300",
    borderColor: "border-amber-300",
    background: "bg-amber-300/50",
    card: "bg-amber-300/90",
  },
  Education: {
    image: '/pages/themes/rolex-learning-center.jpg',
    head: "/pages/themes/heads/chignon.png",
    color: "bg-indigo-300",
    borderColor: "border-indigo-300",
    background: "bg-indigo-300/50",
    card: "bg-indigo-300/90",
    transform: {
      gravity: 'west',
      crop: "fill"
    }
  },
  Family: {
    image: '/pages/themes/famille-musee-olympique.jpg',
    head: "/pages/themes/heads/lunettessoleil.png",
    color: "bg-teal-300",
    borderColor: "border-teal-300",
    background: "bg-teal-300/50",
    card: "bg-teal-300/90",
  },
  Gastronomy: {
    image: '/pages/themes/gastronomie_2.jpg',
    head: "/pages/themes/heads/mr_bonnet.png",
    color: "bg-red-300",
    borderColor: "border-red-300",
    background: "bg-red-300/50",
    card: "bg-red-300/90",
  },
  Lacustrine: {
    image: '/pages/themes/lacustre-jetee-compagnie.jpg',
    head: "/pages/themes/heads/punk.png",
    color: "bg-blue-300",
    borderColor: "border-blue-300",
    background: "bg-blue-300/50",
    card: "bg-blue-300/90",
  },
  Nature: {
    image: '/pages/themes/hermitage.jpg',
    head: "/pages/themes/heads/fleur.png",
    color: "bg-apple-300",
    borderColor: "border-apple-300",
    background: "bg-apple-300/50",
    card: "bg-apple-300/90",
    transform: { gravity: "north", crop: 'fill', },
  },
  Sport: {
    image: '/pages/themes/cathedrale_skate.jpg',
    head: "/pages/themes/heads/hockey.png",
    color: "bg-sky-300",
    borderColor: "border-sky-300",
    background: "bg-sky-300/50",
    card: "bg-sky-300/90",
  },
  Sustainability: {
    image: '/pages/themes/vendanges.jpg',
    head: "/pages/themes/heads/garcon.png",
    color: "bg-fuchsia-300",
    borderColor: "border-fuchsia-300",
    background: "bg-fuchsia-300/50",
    card: "bg-fuchsia-300/90",
  },
  Unusual: {
    image: '/pages/themes/insolite-pavillon.jpg',
    head: "/pages/themes/heads/confettis.png",
    color: "bg-pink-300",
    borderColor: "border-pink-300",
    background: "bg-pink-300/50",
    card: "bg-pink-300/90",
    transform: { gravity: 'auto', crop: 'fill' }
  },
  Wellness: {
    image: '/pages/themes/bienetre-brp.jpg',
    head: "/pages/themes/heads/mamie.png",
    color: "bg-lime-300",
    borderColor: "border-lime-300",
    background: "bg-lime-300/50",
    card: "bg-lime-300/90",
  },
}

export const getThemeByTagName = (tag: string | undefined): undefined | Theme => {
  switch (tag) {
    case 'lt-architecture':
      return Themes.Architecture;
    case 'lt-culture':
      return Themes.Culture;
    case 'lt-education':
      return Themes.Education;
    case 'lt-famille':
      return Themes.Family;
    case 'lt-gastronomie':
      return Themes.Gastronomy;
    case 'lt-lacustre':
      return Themes.Lacustrine;
    case 'lt-nature':
      return Themes.Nature;
    case 'lt-sport':
      return Themes.Sport;
    case 'lt-durabilite':
      return Themes.Sustainability;
    case 'lt-insolite':
      return Themes.Unusual;
    case 'lt-bien-etre':
      return Themes.Wellness;
    default:
      return undefined;
  }
}

export const getRandomTheme = () => {
  const values = Object.values(Themes);
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
};