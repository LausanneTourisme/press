import {
  Forms,
  FormsKeys,
  getValues,
  MediaTypes,
  MediaTypesKeys,
  RouteTypes,
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
      'coverage',
      'highlights',
      'themes',
      'press-release',
      'press-kit',
      'press-releases-and-press-kits',
      'form'
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
