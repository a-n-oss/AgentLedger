import { notFound } from "next/navigation";
import { getProject } from "@/app/actions";
import { ApiKeyManager } from "@/components/api-key-manager";
import { ProviderKeysManager } from "@/components/provider-keys-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProject(id);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">{data.project.name}</h1>
        <p className="text-sm text-[var(--al-muted)]">
          Proxy base URL: <code>/api/v1</code> · headers <code>x-al-agent</code>,{" "}
          <code>x-al-team</code>
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Install snippet</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="al-code overflow-x-auto rounded-md p-4 text-xs">
{`const openai = new OpenAI({
  apiKey: "YOUR_AGENTLEDGER_KEY",
  baseURL: "${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/v1",
  defaultHeaders: { "x-al-agent": "my-agent", "x-al-team": "platform" },
});`}
          </pre>
        </CardContent>
      </Card>
      <ProviderKeysManager
        projectId={data.project.id}
        secrets={data.providerKeys}
        secretsKeyConfigured={data.secretsKeyConfigured}
      />
      <ApiKeyManager projectId={data.project.id} keys={data.keys} />
    </div>
  );
}
