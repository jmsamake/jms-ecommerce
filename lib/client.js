import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = sanityClient({
  projectId: 'k3r5cxhk',
  dataset: 'production',
  apiVersion: '2022-03-10',
  useCdn: true,
  token: process.env.SANITY_WRITE_KEY
  //token: process.env.NEXT_PUBLIC_SANITY_TOKEN SANITY_WRITE_KEY
});

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);