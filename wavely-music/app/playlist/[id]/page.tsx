import PlaylistClient from './PlaylistClient';

export async function generateStaticParams() {
  // For static export with Capacitor, we need to provide at least one param
  // The actual playlist loading will happen client-side
  return [
    { id: 'example' }
  ];
}

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlaylistClient id={id} />;
}
