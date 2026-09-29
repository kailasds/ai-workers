import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { KnowledgeScope } from "@/lib/v2/types";

export const scopeMeta: Record<KnowledgeScope, { label: string; description: string; heading: string }> = {
  assigned: { label: "Assigned", description: "Knowledge given to Workers", heading: "Knowledge intentionally given to Workers." },
  gained: { label: "Gained", description: "Knowledge learned through experience", heading: "Knowledge learned by Workers through experience." },
  platform: { label: "Platform", description: "Knowledge approved for reuse", heading: "Knowledge trusted for reuse across Workers." },
};

/** The primary Knowledge mental model: Given, Learned, Shared. */
export function KnowledgeScopeTabs({
  value,
  onChange,
  counts,
  children,
}: {
  value: KnowledgeScope;
  onChange: (v: KnowledgeScope) => void;
  counts: Record<KnowledgeScope, number>;
  children: React.ReactNode;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as KnowledgeScope)}>
      <TabsList aria-label="Knowledge scope">
        {(Object.keys(scopeMeta) as KnowledgeScope[]).map((s) => (
          <TabsTrigger key={s} value={s} title={scopeMeta[s].description}>
            {scopeMeta[s].label}
            <span className="ml-2 tabular-nums opacity-70">{counts[s]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

export const KnowledgeScopeContent = TabsContent;
