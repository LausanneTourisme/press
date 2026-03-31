import { dev } from '$app/environment';
import { ConsentsTypes, type ConsentType } from '$enums';
import {
  APSIS_CLIENT_ID,
  APSIS_CLIENT_SECRET,
  APSIS_CONSENTS_CONTENT_MEDIA_CREATOR_DISCRIMINATOR,
  APSIS_CONSENTS_MEDIA_PRESS_DISCRIMINATOR,
  APSIS_CONSENTS_NEWSLETTER_PRESS_DISCRIMINATOR,
  APSIS_KEYSPACE_DISCRIMINATOR,
  APSIS_SECTION_DISCRIMINATOR
} from '$env/static/private';
import AuthenticationError from '$lib/exceptions/AuthenticationError';
import MissingCredentialsError from '$lib/exceptions/MissingCredentialsError';

const baseUrl = 'https://api.apsis.one';

let cachedToken: { token: string; expires: number } | undefined;

const getApsisToken = async (): Promise<string> => {
  const clientID = APSIS_CLIENT_ID;
  const clientSecret = APSIS_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    throw new MissingCredentialsError(
      'Apsis client ID and secret must be set in environment variables.'
    );
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expires > now) {
    return cachedToken.token;
  }

  return await getAccessToken(clientID, clientSecret);
};

const getAccessToken = async (clientID: string, clientSecret: string): Promise<string> => {
  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientID,
      client_secret: clientSecret
    })
  });

  if (!response.ok) {
    throw new AuthenticationError(
      'Failed to obtain access token from Apsis API. Please check your credentials and try again.'
    );
  }

  const json = await response.json();
  const payload = json.access_token.split('.')[1];
  const data = JSON.parse(atob(payload));

  cachedToken = {
    token: json.access_token,
    expires: data.exp * 1000 - 60000 // Subtract 1 minute to ensure token is refreshed before it expires
  };

  return cachedToken.token;
};

/**
 * Creates a new profile in Apsis for the given email.
 * @throws AuthenticationError
 */
export const createProfile = async (email: string): Promise<boolean> => {
  const response = await fetch(
    `${baseUrl}/audience/keyspaces/${APSIS_KEYSPACE_DISCRIMINATOR}/sections/${APSIS_SECTION_DISCRIMINATOR}/profiles`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cachedToken?.token ?? (await getApsisToken())}`
      },
      body: JSON.stringify({
        profile_key: email
      })
    }
  );
  return response.status === 201 || response.status === 409;
};

export const updateProfileAttributes = async ({
  email,
  attributes
}: {
  email: string;
  attributes: Record<string, string | number | boolean | undefined>;
}): Promise<boolean> => {
  const response = await fetch(
    `${baseUrl}/v2/audience/keyspaces/${APSIS_KEYSPACE_DISCRIMINATOR}/profiles/${email}/sections/${APSIS_SECTION_DISCRIMINATOR}/attributes`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
        Authorization: `Bearer ${cachedToken?.token ?? (await getApsisToken())}`
      },
      body: JSON.stringify(attributes)
    }
  );

  if (dev) {
    const text = await response.text();
    console.log({
      request: {
        method: 'PATCH',
        url: `${baseUrl}/v2/audience/keyspaces/${APSIS_KEYSPACE_DISCRIMINATOR}/profiles/${email}/sections/${APSIS_SECTION_DISCRIMINATOR}/attributes`,
        headers: {
          'Content-Type': 'application/merge-patch+json',
          Authorization: `Bearer ${cachedToken?.token ?? (await getApsisToken())}`
        },
        body: JSON.stringify(attributes)
      },
      response: text ? JSON.parse(text) : null
    });
  }

  return response.status === 204;
};

export const addProfileToMailConsents = async ({
  email,
  consentType
}: {
  email: string;
  consentType: ConsentType;
}): Promise<boolean> => {
  const response = await fetch(
    `${baseUrl}/v2/audience/keyspaces/${APSIS_KEYSPACE_DISCRIMINATOR}/profiles/${email}/sections/${APSIS_SECTION_DISCRIMINATOR}/consents`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cachedToken?.token ?? (await getApsisToken())}`
      },
      body: JSON.stringify({
        topic_discriminator: (() => {
          switch (consentType) {
            case ConsentsTypes.MeidaPress:
              return APSIS_CONSENTS_MEDIA_PRESS_DISCRIMINATOR;
            case ConsentsTypes.MediaContentCreator:
              return APSIS_CONSENTS_CONTENT_MEDIA_CREATOR_DISCRIMINATOR;
            case ConsentsTypes.NewsletterPress:
              return APSIS_CONSENTS_NEWSLETTER_PRESS_DISCRIMINATOR;
          }
        })(),
        channel_discriminator: 'com.apsis1.channels.email',
        type: 'opt-in',
        reason: 'Inscription via formulaire de la presse'
      })
    }
  );

  if (dev) {
    const text = await response.text();
    console.log({
      request: {
        method: 'PATCH',
        url: `${baseUrl}/v2/audience/keyspaces/${APSIS_KEYSPACE_DISCRIMINATOR}/profiles/${email}/sections/${APSIS_SECTION_DISCRIMINATOR}/consents`,
        headers: {
          'Content-Type': 'application/merge-patch+json',
          Authorization: `Bearer ${cachedToken?.token ?? (await getApsisToken())}`
        },
        body: {
          topic_discriminator: (() => {
            switch (consentType) {
              case ConsentsTypes.MeidaPress:
                return APSIS_CONSENTS_MEDIA_PRESS_DISCRIMINATOR;
              case ConsentsTypes.MediaContentCreator:
                return APSIS_CONSENTS_CONTENT_MEDIA_CREATOR_DISCRIMINATOR;
              case ConsentsTypes.NewsletterPress:
                return APSIS_CONSENTS_NEWSLETTER_PRESS_DISCRIMINATOR;
            }
          })(),
          channel_discriminator: 'com.apsis1.channels.email',
          type: 'opt-in',
          reason: 'Inscription via formulaire de la presse'
        }
      },
      response: text
    });
  }

  return response.status === 201 || response.status === 204 || response.status === 409;
};
