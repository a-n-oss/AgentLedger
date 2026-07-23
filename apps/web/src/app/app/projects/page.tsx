import Link from "next/link";
import { listProjects } from "@/app/actions";
import { CreateProjectForm } from "@/components/create-project-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProjectsPage() {
  const projects = await listProjects();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Projects</h1>
        <p className="text-sm text-[var(--al-muted)]">API keys and spend scopes</p>
      </div>
      <CreateProjectForm />
      <div className="grid gap-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                <Link href={`/app/projects/${project.id}`} className="hover:underline">
                  {project.name}
                </Link>
              </CardTitle>
              <span className="text-xs text-[var(--al-muted)]">
                {project.retainPayloads ? "Payloads on" : "Metadata only"}
              </span>
            </CardHeader>
            <CardContent className="text-sm text-[var(--al-muted)]">
              Created {project.createdAt.toISOString()}
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && (
          <p className="text-sm text-[var(--al-muted)]">No projects yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}
