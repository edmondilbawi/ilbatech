import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCaseStudy } from "@/components/project-case-study";
import { SITE } from "@/config/site";
import { getWorkProject, WORK_PROJECTS } from "@/config/work-projects";

type WorkProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return WORK_PROJECTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: WorkProjectPageProps): Promise<Metadata> {
  const project = getWorkProject((await params).slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: `${project.title} | ${SITE.shortName}`,
      description: project.description,
    },
  };
}

export default async function WorkProjectPage({ params }: WorkProjectPageProps) {
  const project = getWorkProject((await params).slug);
  if (!project) notFound();

  return <ProjectCaseStudy project={project} />;
}
