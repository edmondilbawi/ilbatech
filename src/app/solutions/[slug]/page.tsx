import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfferingDetail } from "@/components/offering-detail";
import { getSolutionArea, SOLUTION_AREAS } from "@/config/offerings";
import { SITE } from "@/config/site";

type SolutionPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return SOLUTION_AREAS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: SolutionPageProps): Promise<Metadata> {
  const offering = getSolutionArea((await params).slug);
  if (!offering) return {};

  return {
    title: offering.title,
    description: offering.summary,
    alternates: { canonical: `/solutions/${offering.slug}/` },
    openGraph: {
      title: `${offering.title} | ${SITE.shortName}`,
      description: offering.summary,
      url: `/solutions/${offering.slug}/`,
    },
  };
}

export default async function SolutionDetailPage({ params }: SolutionPageProps) {
  const offering = getSolutionArea((await params).slug);
  if (!offering) notFound();

  return <OfferingDetail offering={offering} kind="solution" />;
}
