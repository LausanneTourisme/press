import type { MediaType, SocialNetwork, Title, TravelReduction } from '$enums';

export type MediaProfileJournalist = {
  mediaName?: string;
  thematic?: string;
  audienceProfile?: string;
  mediaTypes: MediaType[];
  printMediaStatistics: {
    copies?: number;
    readers?: number;
    broadcastLocation?: string;
  };
  radioAndTVMediaStatistics: {
    emissionName?: string;
    viewers?: number;
  };
  onlineMediaStatistics: {
    website?: string;
    monthlyUniqueVisitors?: number;
    monthlyPageViews?: number;
  };
  mediaCoveragePrint: {
    totalPages?: number;
    articleLength?: number;
    publishDate?: string;
  };
  mediaCoverageOnline: {
    articleLength?: number;
    articleThematic?: number;
    publishDate?: string;
  };
  mediaCoverageTvOrRadio: {
    articleThematic?: string;
    publishDate?: string;
  };
  travelInformation: {
    departurePoint: {
      city?: string;
      country?: string;
      outwardJourney?: string;
    };
    returnJourney?: string;
    travelReductions: TravelReduction[];
    lastVisit?: string;
  };
  personalInformation: {
    title?: Title;
    firstName?: string;
    lastName?: string;
    birthday?: string;
    phoneNumber?: string;
    email?: string;
    address: {
      streetAddress?: string;
      city?: string;
      postalcode?: string;
      country?: string;
    };
    freelance?: boolean;
    spokenLanguages?: string;
    allergies?: string;
    medicalAndPhysicalCondition?: string;
    passport: {
      number?: string;
      validity?: string;
    };
    emergencyContacts: { name?: string; phoneNumber?: string }[];
  };
  travelInsuranceCoveringSwitzerland?: boolean;
  remarks?: string;
  readTermsOfAcceptance?: boolean;
  newsletter?: boolean;
};

export type MediaProfileContentCreatorFormData = {
  // Basic info
  contentPositioning?: string;
  targetAudience?: string;
  onlinePresence: SocialNetwork[];

  // Instagram - flattened
  instagramProfileURL?: string;
  instagramSubscriberScreenshots?: File[];
  instagramAccountsScreenshots?: File[];

  // TikTok - flattened
  tiktokProfileURL?: string;
  tiktokSubscriberScreenshots?: File[];

  // YouTube - flattened
  youtubeProfileURL?: string;
  youtubeSubscriberScreenshots?: File[];

  // Blog - flattened
  blogURL?: string;
  blogAudienceProfile?: string;
  blogMonthlyUniqueVisitors?: number;
  blogMonthlyPageViews?: number;

  // Coverage
  coveragePublicationAngle: string;
  coverageSubjectsOfInterest: string;
  coveragePublicationChannels: SocialNetwork[];
  coverageProposedMediaCoverage: string;
  coverageTimingAndPublicationDates: string;

  // Travel info - flattened
  travelDepartureCity?: string;
  travelDepartureCountry?: string;
  travelOutwardJourney?: string;
  travelReturnJourney?: string;
  travelReductions: TravelReduction[];
  travelLastVisit?: string;

  // Personal info - flattened
  personalTitle?: Title;
  personalFirstName?: string;
  personalLastName?: string;
  personalBirthday?: string;
  personalPhoneNumber?: string;
  personalEmail?: string;
  personalFreelance?: boolean;
  personalSpokenLanguages?: string;
  personalAllergies?: string;
  personalMedicalCondition?: string;

  // Address - flattened
  addressStreetAddress?: string;
  addressCity?: string;
  addressPostalCode?: string;
  addressCountry?: string;

  // Passport - flattened
  passportNumber?: string;
  passportValidity?: string;

  // Emergency contacts - flattened arrays
  emergencyContactNames: string[];
  emergencyContactPhones: string[];

  // Final fields
  travelInsuranceCoveringSwitzerland?: boolean;
  remarks?: string;
  readTermsOfAcceptance?: boolean;
  newsletter?: boolean;
};
