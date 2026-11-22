import { fetchApi } from '../../../../../lib/server-data';
import { absoluteUrl } from '../../../../../lib/site';

// The reader page is a client component, so chapter metadata lives in this layout.
export async function generateMetadata({ params }) {
  const { id, chapter } = await params;
  const data = await fetchApi(`/comics/${id}?increment=false`);
  if (!data?.comic) return {};

  const chapters = data.chapters || [];
  const index = chapters.findIndex((c) => c._id === chapter);
  const current = chapters[index];
  const canonical = `/comics/${id}/read/${chapter}`;
  if (!current) return { title: data.comic.title, alternates: { canonical } };

  const title = `${data.comic.title} — Chapter ${index + 1}: ${current.title}`;
  const description = `Read Chapter ${index + 1}, "${current.title}", of ${data.comic.title} on TB Creation.`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: absoluteUrl(canonical),
      images: data.comic.coverUrl ? [absoluteUrl(data.comic.coverUrl)] : undefined,
    },
    // Locked chapters are a signup wall, not content worth indexing.
    robots: current.locked ? { index: false, follow: true } : undefined,
  };
}

export default function ChapterLayout({ children }) {
  return children;
}
