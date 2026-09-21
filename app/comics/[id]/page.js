import { notFound } from 'next/navigation';
import { fetchApi } from '../../../lib/server-data';
import { absoluteUrl } from '../../../lib/site';
import ComicDetail from '../../../components/ComicDetail';
import JsonLd from '../../../components/ui/JsonLd';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await fetchApi(`/comics/${id}?increment=false`);
  if (!data?.comic) return {};
  const comic = data.comic;
  const cover = absoluteUrl(comic.coverUrl);
  return {
    title: comic.title,
    description:
      comic.description || `${comic.title} — an original comic series on TB Creation.`,
    openGraph: {
      title: comic.title,
      description: comic.description,
      type: 'article',
      url: absoluteUrl(`/comics/${comic._id}`),
      images: cover ? [cover] : undefined,
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title: comic.title,
      description: comic.description,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function ComicDetailPage({ params }) {
  const { id } = await params;
  const data = await fetchApi(`/comics/${id}?increment=false`);
  if (!data?.comic) notFound();
  const comic = data.comic;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWorkSeries',
          name: comic.title,
          description: comic.description,
          genre: comic.genre,
          url: absoluteUrl(`/comics/${comic._id}`),
          image: comic.coverUrl ? absoluteUrl(comic.coverUrl) : undefined,
          author: { '@type': 'Person', name: comic.author?.name },
          dateCreated: comic.createdAt,
        }}
      />
      <ComicDetail data={data} />
    </>
  );
}