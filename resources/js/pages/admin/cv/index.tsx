import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Briefcase, CheckCircle2, Loader2, Monitor, XCircle } from 'lucide-react';
import type { ComponentType } from 'react';
import { PageHeading } from '@/components/admin/page-heading';
import { Button } from '@/components/ui/button';
import cvRoutes from '@/routes/portfolio/cv';

type CvData = {
  id: number;
  title: string;
  ats_total: number;
  ats_scores: Record<string, number>;
  updated_at: string;
} | null;

type Props = {
  cv: CvData;
};

export default function CvIndex({ cv }: Props) {
  return (
    <>
      <Head title="CV Builder" />
      <div className="mx-auto w-full max-w-7xl p-5 sm:p-8">
        <PageHeading
          eyebrow="Career tools"
          title="CV Builder"
          description="Create, edit, and optimize your professional CV with real-time ATS scoring."
          action={
            <Button asChild>
              <Link href={cvRoutes.create()}>
                Create new CV
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />

        {!cv && (
          <div className="mt-6 flex items-center justify-center space-x-4">
            <Monitor className="size-6 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-semibold">No CV found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first professional CV to get started.
              </p>
            </div>
          </div>
        )}

        {cv && (
          <div className="mt-6 grid gap-6">
            <section className="overflow-hidden rounded-xl border bg-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h3 className="font-semibold">Your CV</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last updated: {new Date(cv.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={cvRoutes.edit({ cv: cv.id })}>
                      Edit CV
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your CV? This action cannot be undone.')) {
                        alert('Delete functionality would be implemented here');
                      }
                    }}
                  >
                    <XCircle className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="px-5 pt-4 pb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Professional Title</h4>
                    <p className="text-muted-foreground">{cv.title || 'Not set'}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">ATS Score</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-32 relative">
                        <svg
                          className="absolute inset-0 h-full w-full text-muted-foreground/20"
                          viewBox="0 0 64 64"
                          aria-hidden="true"
                        >
                          <circle cx="32" cy="32" r="30" strokeWidth="4" />
                        </svg>
                        <svg
                          className="absolute inset-0 h-full w-full transition-transform duration-750 transform -rotate-90"
                          viewBox="0 0 64 64"
                          aria-hidden="true"
                        >
                          <circle
                            cx="32"
                            cy="32"
                            r="30"
                            strokeWidth="4"
                            stroke="currentColor"
                            style={{ strokeDasharray: `${cv.ats_total}, 100` }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                          {cv.ats_total}/100
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <p className="font-medium">ATS Compatibility</p>
                        <p className="text-muted-foreground">
                          {cv.ats_total >= 80
                            ? 'Excellent'
                            : cv.ats_total >= 60
                            ? 'Good'
                            : cv.ats_total >= 40
                            ? 'Fair'
                            : 'Needs Improvement'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Score Breakdown</h4>
                    <div className="grid gap-2">
                      {Object.entries(cv.ats_scores || {}).map(([criterion, score]) => (
                        <div key={criterion} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {criterion
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 relative">
                              <div
                                className="absolute left-0 top-0 h-2 w-full bg-muted"
                                role="presentation"
                              />
                              <div
                                className="absolute left-0 top-0 h-2 bg-highlight"
                                role="presentation"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono">{score}/10</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border bg-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h3 className="font-semibold">Preview & Export</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    View how your CV will look to employers and download it.
                  </p>
                </div>
              </div>

              <div className="px-5 pt-4 pb-6">
                {/* In a real implementation, this would show a live preview of the CV */}
                <div className="text-center py-8">
                  <Monitor className="size-8 text-muted-foreground/50 mb-4" />
                  <h4 className="font-medium mb-2">CV Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    Your CV preview will appear here. Click "Edit CV" to build your
                    professional resume.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Download PDF
                  </Button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
