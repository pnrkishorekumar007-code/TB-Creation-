import { notFound } from 'next/navigation';
import { fetchApi } from '../../../lib/server-data';
import { absoluteUrl } from '../../../lib/site';
import AuthorProfile from '../../../components/AuthorProfile';
import JsonLd from '../../../components/ui/JsonLd';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await fetchApi(`/authors/${id}`);
  if (!data?.author) return {};
  const author = data.author;
  return {
    title: author.name,
    description:
      author.bio || `Creator profile for ${author.name} on TB Creation.`,
    openGraph: {
      title: author.name,
      description: author.bio,
      type: 'profile',
      url: absoluteUrl(`/authors/${author._id}`),
      images: author.avatarUrl ? [absoluteUrl(author.avatarUrl)] : undefined,
    },
  };
}

export default async function AuthorProfilePage({ params }) {
  const { id } = await params;
  const data = await fetchApi(`/authors/${id}`);
  if (!data?.author) notFound();
  const author = data.author;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: author.name,
          description: author.bio,
          url: absoluteUrl(`/authors/${author._id}`),
          image: author.avatarUrl ? absoluteUrl(author.avatarUrl) : undefined,
        }}
      />
      <AuthorProfile data={data} />
    </>
  );
}