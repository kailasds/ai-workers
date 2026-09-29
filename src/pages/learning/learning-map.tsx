import { Link } from "react-router-dom";
import { ArrowLeft, Map as MapIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import LearningLandscape from "@/pages/learning/learning-landscape";

/** The full learning graph, kept as an advanced view behind "Explore map". */
export default function LearningMap() {
  return (
    <div className="pb-12">
      <div className="px-8 pt-6">
        <Link to="/learning" className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent-ink hover:underline underline-offset-2">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Learning
        </Link>
      </div>
      <PageHeader
        title="Explore map"
        subtitle="Follow how work becomes patterns, learning, and knowledge. Select any node for details."
        icon={MapIcon}
        tone="accent"
      />
      <div className="px-8">
        <LearningLandscape />
      </div>
    </div>
  );
}
