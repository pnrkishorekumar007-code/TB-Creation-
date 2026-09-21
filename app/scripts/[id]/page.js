import { notFound } from 'next/navigation';
import { fetchApi } from '../../../lib/server-data';
import { absoluteUrl } from '../../../lib/site';
import ScriptDetail from '../../../components/ScriptDetail';
import JsonLd from '../../../components/ui/JsonLd';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await fetchApi(`/scripts/${id}?increment=false`);
  if (!data) return {};
  return {
    title: data.title,
    description: data.synopsis || `Read the script for "${data.title}" on TB Creation.`,
    openGraph: {
      title: data.title,
      description: data.synopsis,
      type: 'article',
      url: absoluteUrl(`/scripts/${data._id}`),
    },
  };
}

export default async function ScriptDetailPage({ params }) {
  const { id } = await params;
  const script = await fetchApi(`/scripts/${id}?increment=false`);
  if (!script) notFound();

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: script.title,
          description: script.synopsis,
          genre: script.genre,
          url: absoluteUrl(`/scripts/${script._id}`),
          author: { '@type': 'Person', name: script.author?.name },
          dateCreated: script.createdAt,
        }}
      />
      <ScriptDetail script={script} />
    </>
  );
}