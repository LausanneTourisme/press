import {
  ConsentTypesKeys,
  Forms,
  FormsKeys,
  getValues,
  MediaTypes,
  MediaTypesKeys,
  RouteTypes,
  RouteTypesKeys,
  SocialNetworks,
  SocialNetworksKeys,
  ThemeKeys,
  Themes,
  Titles,
  TitlesKeys,
  TravelReductions,
  TravelReductionsKeys
} from '$enums';
import { describe, expect, it } from 'vitest';

describe('get keys from enums', () => {
  it('RouteTypes', () => {
    const keys = RouteTypesKeys;
    expect(keys).toEqual({
      articles: 'Articles',
      contact: 'Contact',
      coverages: 'Coverages',
      highlights: 'Highlights',
      home: 'Home',
      'press-releases': 'Pressreleases',
      'press-kits': 'Presskits',
      'press-releases-and-press-kits': 'PressreleasesAndPresskits',
      themes: 'Themes',
      forms: 'Forms'
    });
  });
  it('Theme', () => {
    const keys = ThemeKeys;
    expect(keys).toEqual({
      architecture: 'Architecture',
      culture: 'Culture',
      education: 'Education',
      family: 'Family',
      gastronomy: 'Gastronomy',
      lacustrine: 'Lacustrine',
      nature: 'Nature',
      sport: 'Sport',
      sustainability: 'Sustainability',
      unusual: 'Unusual',
      wellness: 'Wellness'
    });
  });
  it('Forms', () => {
    const keys = FormsKeys;
    expect(keys).toEqual({
      'content-creator': 'ContentCreator',
      journalist: 'Journalist',
      'media-coverage': 'MediaCoverage',
      thanks: 'Thanks'
    });
  });
  it('ConsentTypes', () => {
    const keys = ConsentTypesKeys;
    expect(keys).toEqual({
      'media-content-creator': 'MediaContentCreator',
      'media-press': 'MeidaPress',
      'newsletter-press': 'NewsletterPress'
    });
  });
  it('MediaTypes', () => {
    const keys = MediaTypesKeys;
    expect(keys).toEqual({
      online: 'Online',
      print: 'Print',
      radio: 'Radio',
      tv: 'Tv'
    });
  });
  it('TravelReductions', () => {
    const keys = TravelReductionsKeys;
    expect(keys).toEqual({
      'half-fare': 'HalfFare',
      'point-to-point-travelcard': 'PointToPointTravelcard',
      'swiss-ga-travelcard': 'SwissGATravelCard'
    });
  });
  it('Titles', () => {
    const keys = TitlesKeys;
    expect(keys).toEqual({
      mr: 'Mr',
      mrs: 'Mrs',
      they: 'They'
    });
  });
  it('SocialNetworks', () => {
    const keys = SocialNetworksKeys;
    expect(keys).toEqual({
      blog: 'Blog',
      instagram: 'Instagram',
      tiktok: 'TikTok',
      youtube: 'YouTube'
    });
  });
});

describe('get values from enums', () => {
  it('Theme', () => {
    expect(getValues(RouteTypes)).toEqual([
      'home',
      'articles',
      'contact',
      'coverages',
      'highlights',
      'themes',
      'press-releases',
      'press-kits',
      'press-releases-and-press-kits',
      'forms'
    ]);
  });
  it('Theme', () => {
    expect(getValues(Themes)).toEqual([
      'culture',
      'nature',
      'sport',
      'gastronomy',
      'education',
      'sustainability',
      'family',
      'architecture',
      'lacustrine',
      'wellness',
      'unusual'
    ]);
  });
  it('Forms', () => {
    expect(getValues(Forms)).toEqual(['journalist', 'content-creator', 'media-coverage', 'thanks']);
  });
  it('MediaTypes', () => {
    expect(getValues(MediaTypes)).toEqual(['print', 'online', 'tv', 'radio']);
  });
  it('TravelReductions', () => {
    expect(getValues(TravelReductions)).toEqual([
      'point-to-point-travelcard',
      'half-fare',
      'swiss-ga-travelcard'
    ]);
  });
  it('Titles', () => {
    expect(getValues(Titles)).toEqual(['mrs', 'mr', 'they']);
  });
  it('SocialNetworks', () => {
    expect(getValues(SocialNetworks)).toEqual(['instagram', 'tiktok', 'youtube', 'blog']);
  });
});
