import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfferingDetail } from "@/components/offering-detail";
import { getServiceArea, SERVICE_AREAS } from "@/config/offerings";
import { SITE } from "@/config/site";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_AREAS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const offering = getServiceArea((await params).slug);
  if (!offering) return {};

  return {
    title: offering.title,
    description: offering.summary,
    openGraph: {
      title: `${offering.title} | ${SITE.shortName}`,
      description: offering.summary,
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const offering = getServiceArea((await params).slug);
  if (!offering) notFound();

  return <OfferingDetail offering={offering} kind="service" />;
}
