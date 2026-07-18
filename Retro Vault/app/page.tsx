import { getGameBySlug } from "@/lib/rawg";
import GameDetails from "@/components/GameDetails";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: { slug: string };
}

// SEO: título/descripción dinámicos por juego
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const game = await getGameBySlug(params.slug);
    return {
      title: `${game.title} — RetroVault`,
      description: game.description.slice(0, 155),
      openGraph: { images: game.coverUrl ? [game.coverUrl] : [] },
    };
  } catch {
    return { title: "Juego no encontrado — RetroVault" };
  }
}

export default async function GamePage({ params }: Props) {
  try {
    const game = await getGameBySlug(params.slug);
    return <GameDetails game={game} />;
  } catch (err) {
    notFound();
  }
}
