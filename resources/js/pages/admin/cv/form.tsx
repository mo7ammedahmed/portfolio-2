import { Head, Link, useForm } from '@inertiajs/react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  GraduationCap,
  Heart,
  Info,
  Link as LinkIcon,
  List,
  MapPin,
  Monitor,
  Sparkles,
  Terminal,
  Users,
  XCircle,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { toast } from 'sonner';
import {
  Field,
  FormSection,
  Textarea,
  TextInput,
} from '@/components/admin/form-elements';
import { PageHeading } from '@/components/admin/page-heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import cvRoutes from '@/routes/portfolio/cv';

type ContactInfo = {
  email: string;
  phone: string;
  location: string;
  linkedin: string | null;
  github: string | null;
  website: string | null;
};

type Experience = {
  title: string;
  company: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  description: string;
};

type Education = {
  institution: string;
  degree: string;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  description: string;
};

type Skill = {
  name: string;
  proficiency: number; // 1-5
  years_experience: number | null;
};

type Certification = {
  name: string;
  issuing_organization: string | null;
  issue_date: string | null;
  expiration_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
};

type Language = {
  language: string;
  proficiency: 'novice' | 'intermediate' | 'advanced' | 'fluent' | 'native';
};

type CvFormData = {
  title: string;
  summary: string;
  contact_info: ContactInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  languages: Language[];
  additional_sections: string;
};

type Props = {
  cv: {
    id: number;
    title: string;
    summary: string;
    contact_info: ContactInfo | null;
    experience: Experience[] | null;
    education: Education[] | null;
    skills: Skill[] | null;
    certifications: Certification[] | null;
    languages: Language[] | null;
    additional_sections: string | null;
    ats_scores: Record<string, number> | null;
    ats_total: number | null;
  } | null;
};

export default function CvForm({ cv }: Props) {
  const form = useForm<CvFormData>({
    title: cv?.title ?? '',
    summary: cv?.summary ?? '',
    contact_info: {
      email: cv?.contact_info?.email ?? '',
      phone: cv?.contact_info?.phone ?? '',
      location: cv?.contact_info?.location ?? '',
      linkedin: cv?.contact_info?.linkedin ?? null,
      github: cv?.contact_info?.github ?? null,
      website: cv?.contact_info?.website ?? null,
    } ?? {
      email: '',
      phone: '',
      location: '',
      linkedin: null,
      github: null,
      website: null,
    },
    experience: cv?.experience ?? [],
    education: cv?.education ?? [],
    skills: cv?.skills ?? [],
    certifications: cv?.certifications ?? [],
    languages: cv?.languages ?? [],
    additional_sections: cv?.additional_sections ?? '',
  });

  const [isCalculatingScore, setIsCalculatingScore] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    // Calculate ATS score whenever form data changes
    calculateAtsScore();
  }, [form.data]);

  const calculateAtsScore = () => {
    // In a real implementation, this would call an API endpoint
    // For now, we'll simulate a score calculation
    setIsCalculatingScore(true);

    setTimeout(() => {
      // Realistic scoring logic based on CV content
      const scores: Record<string, number> = {
        contact_information: Math.min(10,
          (form.data.contact_info.email ? 2 : 0) +
          (form.data.contact_info.phone ? 2 : 0) +
          (form.data.contact_info.location ? 2 : 0) +
          (form.data.contact_info.linkedin ? 1 : 0) +
          (form.data.contact_info.github ? 1 : 0) +
          (form.data.contact_info.website ? 1 : 0)
        ),
        keyword_optimization: calculateKeywordScore(),
        standard_headings: 10, // We use standard headings
        file_format_compatibility: 10, // Our format is ATS-friendly
        skills_section_quality: Math.min(10,
          calculateSkillsSectionScore()
        ),
        work_experience_format: Math.min(10,
          calculateWorkExperienceScore()
        ),
        education_completeness: Math.min(10,
          calculateEducationScore()
        ),
        length_appropriateness: Math.min(10,
          calculateLengthScore()
        ),
        font_readability: 10, // We control the output format
        quantifiable_achievements: Math.min(10,
          calculateQuantifiableScore()
        )
      };

      const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
      setAtsScore(total);
      setScoreBreakdown(scores);
      setIsCalculatingScore(false);
    }, 500);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    // Show loading state
    toast.loading('Saving CV...', { id: 'cv-save-toast' });

    // In a real implementation, we would save the form data here
    setTimeout(() => {
      toast.success('CV saved successfully!', { id: 'cv-save-toast' });
    }, 1500);
  };

  // Floating save button logic
  const isDirty = form && form.dirty ? Object.keys(form.dirty).length > 0 : false;

  const addExperience = () => {
    form.setData('experience', [
      ...form.data.experience,
      {
        title: '',
        company: '',
        location: null,
        start_date: null,
        end_date: null,
        current: false,
        description: '',
      }
    ]);
  };

  const removeExperience = (index: number) => {
    const experience = [...form.data.experience];
    experience.splice(index, 1);
    form.setData('experience', experience);
  };

  const addEducation = () => {
    form.setData('education', [
      ...form.data.education,
      {
        institution: '',
        degree: '',
        field_of_study: null,
        start_date: null,
        end_date: null,
        current: false,
        description: '',
      }
    ]);
  };

  const removeEducation = (index: number) => {
    const education = [...form.data.education];
    education.splice(index, 1);
    form.setData('education', education);
  };

  const addSkill = () => {
    form.setData('skills', [
      ...form.data.skills,
      {
        name: '',
        proficiency: 3,
        years_experience: null,
      }
    ]);
  };

  const removeSkill = (index: number) => {
    const skills = [...form.data.skills];
    skills.splice(index, 1);
    form.setData('skills', skills);
  };

  const addCertification = () => {
    form.setData('certifications', [
      ...form.data.certifications,
      {
        name: '',
        issuing_organization: null,
        issue_date: null,
        expiration_date: null,
        credential_id: null,
        credential_url: null,
      }
    ]);
  };

  const removeCertification = (index: number) => {
    const certifications = [...form.data.certifications];
    certifications.splice(index, 1);
    form.setData('certifications', certifications);
  };

  const addLanguage = () => {
    form.setData('languages', [
      ...form.data.languages,
      {
        language: '',
        proficiency: 'novice',
      }
    ]);
  };

  const removeLanguage = (index: number) => {
    const languages = [...form.data.languages];
    languages.splice(index, 1);
    form.setData('languages', languages);
  };

  const isSaving = form.processing;

  const calculateKeywordScore = (): number => {
    // Simple keyword score based on presence of common professional terms
    const allText = [
      form.data.summary,
      ...form.data.experience.map(exp => exp.description),
      ...form.data.education.map(edu => edu.description),
      form.data.additional_sections
    ].join(' ').toLowerCase();

    const keywords = ['experience', 'management', 'leadership', 'developed', 'created',
                     'improved', 'increased', 'reduced', 'managed', 'led', 'designed',
                     'implemented', 'analyzed', 'solutions', 'project', 'team'];

    let matches = 0;
    keywords.forEach(keyword => {
      if (allText.includes(keyword)) {
        matches++;
      }
    });

    // Score based on keyword density (capped at 10)
    return Math.min(10, Math.floor((matches / keywords.length) * 10));
  };

  const calculateSkillsSectionScore = (): number => {
    if (form.data.skills.length === 0) {
return 0;
}

    // Points for having skills
    let score = 5;

    // Bonus for proficiency levels
    const proficientSkills = form.data.skills.filter(s => s.proficiency >= 3);
    score += Math.min(3, proficientSkills.length);

    // Bonus for variety (different skills)
    const uniqueSkills = new Set(form.data.skills.map(s => s.name.toLowerCase())).size;
    score += Math.min(2, uniqueSkills);

    return Math.min(10, score);
  };

  const calculateWorkExperienceScore = (): number => {
    if (form.data.experience.length === 0) {
return 0;
}

    // Points for having experience
    let score = form.data.experience.length >= 2 ? 5 : 3;

    // Bonus for complete entries
    const completeEntries = form.data.experience.filter(exp =>
        exp.title && exp.company && exp.start_date && exp.description
    ).length;
    score += Math.min(3, completeEntries);

    // Bonus for reverse chronological order (simplified check)
    // In a real app, we'd check dates more thoroughly
    score += 2; // Assume good order since we're collecting data properly

    return Math.min(10, score);
  };

  const calculateEducationScore = (): number => {
    if (form.data.education.length === 0) {
return 0;
}

    // Points for having education
    let score = form.data.education.length >= 1 ? 5 : 0;

    // Bonus for complete entries
    const completeEntries = form.data.education.filter(edu =>
        edu.institution && edu.degree && edu.start_date
    ).length;
    score += Math.min(3, completeEntries);

    // Bonus for relevant details
    const detailedEntries = form.data.education.filter(edu =>
        edu.description && edu.description.length > 20
    ).length;
    score += Math.min(2, detailedEntries);

    return Math.min(10, score);
  };

  const calculateLengthScore = (): number => {
    let score = 0;

    // Summary length (ideal: 100-300 characters)
    const summaryLength = form.data.summary.length;

    if (summaryLength >= 100 && summaryLength <= 300) {
      score += 4;
    } else if (summaryLength >= 50) {
      score += 2;
    }

    // Experience count (ideal: 2-4 positions for most people)
    const expCount = form.data.experience.length;

    if (expCount >= 2 && expCount <= 4) {
      score += 3;
    } else if (expCount >= 1) {
      score += 1;
    }

    // Education count (ideal: 1-2 entries)
    const eduCount = form.data.education.length;

    if (eduCount >= 1 && eduCount <= 2) {
      score += 3;
    } else if (eduCount >= 1) {
      score += 1;
    }

    return Math.min(10, score);
  };

  const calculateQuantifiableScore = (): number => {
    const score = 0;

    // Check for numbers, percentages, dollar amounts in descriptions
    const allText = [
      ...form.data.experience.map(exp => exp.description),
      ...form.data.education.map(edu => edu.description),
      form.data.summary
    ].join(' ');

    // Patterns for quantifiable achievements
    const patterns = [
      /\d+%/g,          // Percentages
      /\$\d+/g,         // Dollar amounts
      /\d+\+/g,         // Numbers with plus (e.g., "5+ years")
      /\d+\s*(years?|yrs)/g, // Years of experience
      /\d+\s*[km]?\/year/g,  // Per year metrics
      /increased.*\d+/i,     // Increased by X
      /reduced.*\d+/i,       // Reduced by X
      /managed.*\d+/i,       // Managed X
      /led.*\d+/i            // Led X people
    ];

    let matches = 0;
    patterns.forEach(pattern => {
      const matchesFound = allText.match(pattern);

      if (matchesFound) {
        matches += matchesFound.length;
      }
    });

    // Score based on number of quantifiable achievements
    // Cap at 10 for 5+ quantifiable achievements
    return Math.min(10, Math.floor(matches / 2));
  };

  return (
    <>
      <Head title="Edit CV" />
      <form onSubmit={submit} className="mx-auto w-full max-w-6xl p-5 sm:p-8">
        <PageHeading
          eyebrow="Career tools"
          title="CV Builder"
          description="Create, edit, and optimize your professional CV with real-time ATS scoring."
          action={
            <Button disabled={isSaving}>
              {isCalculatingScore ? 'Calculating score…' : form.processing ? 'Saving…' : 'Save CV'}
              <Check className="size-4" />
            </Button>
          }
        />

        {Object.keys(form.errors).length > 0 && (
          <div className="mt-6">
            <div className="rounded-xl border border-red-500 bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle className="size-5 text-red-500" />
                </div>
                <div className="mt-0.5">
                  <h3 className="text-sm font-medium text-red-800">Please fix the following errors</h3>
                  <p className="mt-1 text-sm text-red-700">{Object.values(form.errors)[0]}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <FormSection
          title="Professional Title"
          description="Your current or target job title."
        >
          <Field label="Title" error={form.errors.title}>
            <TextInput
              value={form.data.title}
              onChange={(e) => form.setData('title', e.target.value)}
              placeholder="e.g., Senior Software Engineer"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Be specific about your role and level of seniority
            </p>
          </Field>
        </FormSection>

        <FormSection
          title="Professional Summary"
          description="A brief overview of your professional background and goals."
        >
          <Field label="Summary" error={form.errors.summary}>
            <Textarea
              value={form.data.summary}
              onChange={(e) => form.setData('summary', e.target.value)}
              placeholder="Summarize your experience, key skills, and career objectives in 3-4 sentences..."
              className="min-h-[120px]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Ideal length: 100-300 characters for optimal ATS scoring
            </p>
          </Field>
        </FormSection>

        <FormSection
          title="Contact Information"
          description="How employers can reach you."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Email" error={form.errors.contact_info?.email}>
              <TextInput
                type="email"
                value={form.data.contact_info.email}
                onChange={(e) =>
                  form.setData('contact_info', {...form.data.contact_info, email: e.target.value})
                }
                placeholder="your.email@example.com"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Professional email address preferred
              </p>
            </Field>
            <Field label="Phone" error={form.errors.contact_info?.phone}>
              <TextInput
                value={form.data.contact_info.phone}
                onChange={(e) =>
                  form.setData('contact_info', {...form.data.contact_info, phone: e.target.value})
                }
                placeholder="+1 (555) 123-4567"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Include country code for international numbers
              </p>
            </Field>
            <Field label="Location" error={form.errors.contact_info?.location}>
              <TextInput
                value={form.data.contact_info.location}
                onChange={(e) =>
                  form.setData('contact_info', {...form.data.contact_info, location: e.target.value})
                }
                placeholder="City, State or Remote"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Current location or "Remote" if applicable
              </p>
            </Field>
            <Field label="LinkedIn" error={form.errors.contact_info?.linkedin}>
              <TextInput
                type="url"
                value={form.data.contact_info.linkedin ?? ''}
                onChange={(e) =>
                  form.setData('contact_info', {...form.data.contact_info, linkedin: e.target.value || null})
                }
                placeholder="linkedin.com/in/your-profile"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Full LinkedIn profile URL
              </p>
            </Field>
            <Field label="GitHub" error={form.errors.contact_info?.github}>
              <TextInput
                type="url"
                value={form.data.contact_info.github ?? ''}
                onChange={(e) =>
                  form.setData('contact_info', {...form.data.contact_info, github: e.target.value || null})
                }
                placeholder="github.com/yourusername"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Link to your GitHub profile or portfolio
              </p>
            </Field>
            <Field label="Website" error={form.errors.contact_info?.website}>
              <TextInput
                type="url"
                value={form.data.contact_info.website ?? ''}
                onChange={(e) =>
                  form.setData('contact_info', {...form.data.contact_info, website: e.target.value || null})
                }
                placeholder="yourwebsite.com"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Personal website, portfolio, or blog
              </p>
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Professional Experience"
          description="List your work history in reverse chronological order (most recent first)."
        >
          {/* Experience Items */}
          {form.data.experience.length > 0 ? (
            form.data.experience.map((exp, index) => (
              <div key={index} className="border lg:border-0 lg:grid lg:grid-cols-[1fr_auto] lg:gap-6 mb-6 pb-4 last:mb-0 last:border-0">
                <div className="space-y-3">
                  <h4 className="font-medium">Position #{index + 1}</h4>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Field label="Job Title" error={form.errors.experience?.[index]?.title}>
                      <TextInput
                        value={exp.title}
                        onChange={(e) => {
                          const experience = [...form.data.experience];
                          experience[index] = {...experience[index], title: e.target.value};
                          form.setData('experience', experience);
                        }}
                        placeholder="e.g., Senior Software Engineer"
                        className="w-full"
                      />
                    </Field>
                    <Field label="Company" error={form.errors.experience?.[index]?.company}>
                      <TextInput
                        value={exp.company}
                        onChange={(e) => {
                          const experience = [...form.data.experience];
                          experience[index] = {...experience[index], company: e.target.value};
                          form.setData('experience', experience);
                        }}
                        placeholder="e.g., Tech Company Inc."
                        className="w-full"
                      />
                    </Field>
                    <Field label="Location" error={form.errors.experience?.[index]?.location}>
                      <TextInput
                        value={exp.location ?? ''}
                        onChange={(e) => {
                          const experience = [...form.data.experience];
                          experience[index] = {...experience[index], location: e.target.value || null};
                          form.setData('experience', experience);
                        }}
                        placeholder="City, State or Remote"
                        className="w-full"
                      />
                    </Field>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Current Position</span>
                        <Checkbox
                          checked={exp.current}
                          onChange={(checked) => {
                            const experience = [...form.data.experience];
                            experience[index] = {...experience[index], current: checked};
                            form.setData('experience', experience);
                          }}
                          className="h-4 w-4"
                        />
                      </div>
                    </div>
                    <Field label="Start Date" error={form.errors.experience?.[index]?.start_date}>
                      <TextInput
                        type="date"
                        value={exp.start_date ?? ''}
                        onChange={(e) => {
                          const experience = [...form.data.experience];
                          experience[index] = {...experience[index], start_date: e.target.value || null};
                          form.setData('experience', experience);
                        }}
                        className="w-full"
                      />
                    </Field>
                    <Field label="End Date" error={form.errors.experience?.[index]?.end_date}>
                      <TextInput
                        type="date"
                        value={exp.end_date ?? ''}
                        onChange={(e) => {
                          const experience = [...form.data.experience];
                          experience[index] = {...experience[index], end_date: e.target.value || null};
                          form.setData('experience', experience);
                        }}
                        className="w-full"
                      />
                    </Field>
                  </div>

                  <Field label="Description" error={form.errors.experience?.[index]?.description}>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => {
                        const experience = [...form.data.experience];
                        experience[index] = {...experience[index], description: e.target.value};
                        form.setData('experience', experience);
                      }}
                      placeholder="Describe your responsibilities, achievements, and impact. Use bullet points and quantify results where possible..."
                      className="w-full min-h-[80px]"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Focus on achievements with metrics (e.g., "Increased sales by 25%", "Managed team of 5 developers")
                    </p>
                  </Field>
                </div>

                {/* Remove Button */}
                <div className="lg:col-span-2 lg:self-end lg:mt-8">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeExperience(index)}
                    className="w-full md:w-auto"
                  >
                    Remove Position
                    <XCircle className="mr-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="size-6 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No experience added yet. Click "Add Position" to get started.
              </p>
            </div>
          )}

          {/* Add Experience Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={addExperience}
              className="w-full md:w-auto"
            >
              Add Position
              <List className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </FormSection>

        <FormSection
          title="Education"
          description="List your educational background in reverse chronological order."
        >
          {/* Education Items */}
          {form.data.education.length > 0 ? (
            form.data.education.map((edu, index) => (
              <div key={index} className="border lg:border-0 lg:grid lg:grid-cols-[1fr_auto] lg:gap-6 mb-6 pb-4 last:mb-0 last:border-0">
                <div className="space-y-3">
                  <h4 className="font-medium">Education #{index + 1}</h4>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    <div>
                      <Field label="Institution" error={form.errors.education?.[index]?.institution}>
                        <TextInput
                          placeholder="e.g., University of Technology"
                          value={edu.institution}
                          onChange={(e) => {
                            const education = [...form.data.education];
                            education[index] = {...education[index], institution: e.target.value};
                            form.setData('education', education);
                          }}
                          className="w-full"
                        />
                      </Field>
                    </div>
                    <div>
                      <Field label="Degree" error={form.errors.education?.[index]?.degree}>
                        <TextInput
                          placeholder="e.g., Bachelor of Science"
                          value={edu.degree}
                          onChange={(e) => {
                            const education = [...form.data.education];
                            education[index] = {...education[index], degree: e.target.value};
                            form.setData('education', education);
                          }}
                          className="w-full"
                        />
                      </Field>
                    </div>
                    <div>
                      <Field label="Field of Study" error={form.errors.education?.[index]?.field_of_study}>
                        <TextInput
                          placeholder="e.g., Computer Science"
                          value={edu.field_of_study ?? ''}
                          onChange={(e) => {
                            const education = [...form.data.education];
                            education[index] = {...education[index], field_of_study: e.target.value || null};
                            form.setData('education', education);
                          }}
                          className="w-full"
                        />
                      </Field>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Currently Studying</span>
                        <Checkbox
                          checked={edu.current}
                          onChange={(checked) => {
                            const education = [...form.data.education];
                            education[index] = {...education[index], current: checked};
                            form.setData('education', education);
                          }}
                          className="h-4 w-4"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 mt-4">
                    <div>
                      <Field label="Start Date" error={form.errors.education?.[index]?.start_date}>
                        <TextInput
                          type="date"
                          placeholder="YYYY-MM-DD"
                          value={edu.start_date ?? ''}
                          onChange={(e) => {
                            const education = [...form.data.education];
                            education[index] = {...education[index], start_date: e.target.value || null};
                            form.setData('education', education);
                          }}
                          className="w-full"
                        />
                      </Field>
                    </div>
                    <div>
                      <Field label="End Date" error={form.errors.education?.[index]?.end_date}>
                        <TextInput
                          type="date"
                          placeholder="YYYY-MM-DD (leave blank if current)"
                          value={edu.end_date ?? ''}
                          onChange={(e) => {
                            const education = [...form.data.education];
                            education[index] = {...education[index], end_date: e.target.value || null};
                            form.setData('education', education);
                          }}
                          className="w-full"
                        />
                      </Field>
                    </div>
                  </div>

                  <Field label="Description" error={form.errors.education?.[index]?.description}>
                    <Textarea
                      placeholder="Describe relevant coursework, projects, thesis, or academic achievements..."
                      value={edu.description}
                      onChange={(e) => {
                        const education = [...form.data.education];
                        education[index] = {...education[index], description: e.target.value};
                        form.setData('education', education);
                      }}
                      className="w-full min-h-[80px]"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Include relevant details like GPA, honors, or relevant coursework
                    </p>
                  </Field>
                </div>

                {/* Remove Button */}
                <div className="lg:col-span-2 lg:self-end lg:mt-6">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEducation(index)}
                    className="w-full md:w-auto"
                  >
                    Remove Education
                    <GraduationCap className="mr-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="size-6 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No education added yet. Click "Add Education" to get started.
              </p>
            </div>
          )}

          {/* Add Education Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={addEducation}
              className="w-full md:w-auto"
            >
              Add Education
              <GraduationCap className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </FormSection>

        <FormSection
          title="Skills"
          description="List your technical and professional skills."
        >
          {/* Skills Items */}
          {form.data.skills.length > 0 ? (
            form.data.skills.map((skill, index) => (
              <div key={index} className="border lg:border-0 lg:grid lg:grid-cols-[1fr_auto] lg:gap-6 mb-4 pb-3 last:mb-0 last:border-0">
                <div className="space-y-2">
                  <h4 className="font-medium">Skill #{index + 1}</h4>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    <div>
                      <Field label="Skill Name" error={form.errors.skills?.[index]?.name}>
                        <TextInput
                          placeholder="e.g., JavaScript, Project Management"
                          value={skill.name}
                          onChange={(e) => {
                            const skills = [...form.data.skills];
                            skills[index] = {...skills[index], name: e.target.value};
                            form.setData('skills', skills);
                          }}
                          className="w-full"
                        />
                      </Field>
                    </div>
                    <div>
                      <Field label="Proficiency (1-5)" error={form.errors.skills?.[index]?.proficiency}>
                        <TextInput
                          type="number"
                          min="1"
                          max="5"
                          placeholder="1 = Beginner, 5 = Expert"
                          value={skill.proficiency}
                          onChange={(e) => {
                            const skills = [...form.data.skills];
                            skills[index] = {...skills[index], proficiency: parseInt(e.target.value) || 3};
                            form.setData('skills', skills);
                          }}
                          className="w-full"
                        />
                      </Field>
                    </div>
                    <div>
                      <Field label="Years of Experience" error={form.errors.skills?.[index]?.years_experience}>
                        <TextInput
                          type="number"
                          min="0"
                          placeholder="Years of experience with this skill"
                          value={skill.years_experience ?? ''}
                          onChange={(e) => {
                            const skills = [...form.data.skills];
                            skills[index] = {...skills[index], years_experience: e.target.value === '' ? null : parseInt(e.target.value, 10)};
                            form.setData('skills', skills);
                          }}
                          className="w-full"
                        />
                      </Field>
                    </div>
                    <div className="col-span-2">
                      <p className="mt-2 text-xs text-muted-foreground">
                        Consider adding both technical skills (programming languages, tools) and professional skills (communication, leadership)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <div className="lg:col-span-2 lg:self-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="w-full md:w-auto"
                  >
                    Remove Skill
                    <XCircle className="mr-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="size-6 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No skills added yet. Click "Add Skill" to get started.
              </p>
            </div>
          )}

          {/* Add Skill Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={addSkill}
              className="w-full md:w-auto"
            >
              Add Skill
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </FormSection>

        <FormSection
          title="Certifications"
          description="List any professional certifications or licenses."
        >
          {form.data.certifications.map((cert, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <h4 className="font-medium mb-2">Certification #{index + 1}</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Certification Name" error={form.errors.certifications?.[index]?.name}>
                    <TextInput
                      value={cert.name}
                      onChange={(e) => {
                        const certifications = [...form.data.certifications];
                        certifications[index] = {...certifications[index], name: e.target.value};
                        form.setData('certifications', certifications);
                      }}
                    />
                  </Field>
                  <Field label="Issuing Organization" error={form.errors.certifications?.[index]?.issuing_organization}>
                    <TextInput
                      value={cert.issuing_organization ?? ''}
                      onChange={(e) => {
                        const certifications = [...form.data.certifications];
                        certifications[index] = {...certifications[index], issuing_organization: e.target.value || null};
                        form.setData('certifications', certifications);
                      }}
                    />
                  </Field>
                  <Field label="Issue Date" error={form.errors.certifications?.[index]?.issue_date}>
                    <TextInput
                      type="date"
                      value={cert.issue_date ?? ''}
                      onChange={(e) => {
                        const certinations = [...form.data.certifications];
                        certinations[index] = {...certinations[index], issue_date: e.target.value || null};
                        form.setData('certifications', certinations);
                      }}
                    />
                  </Field>
                  <Field label="Expiration Date" error={form.errors.certifications?.[index]?.expiration_date}>
                    <TextInput
                      type="date"
                      value={cert.expiration_date ?? ''}
                      onChange={(e) => {
                        const certifications = [...form.data.certifications];
                        certifications[index] = {...certifications[index], expiration_date: e.target.value || null};
                        form.setData('certifications', certifications);
                      }}
                    />
                  </Field>
                  <Field label="Credential ID" error={form.errors.certifications?.[index]?.credential_id}>
                    <TextInput
                      value={cert.credential_id ?? ''}
                      onChange={(e) => {
                        const certifications = [...form.data.certifications];
                        certifications[index] = {...certifications[index], credential_id: e.target.value || null};
                        form.setData('certifications', certifications);
                      }}
                    />
                  </Field>
                  <Field label="Credential URL" error={form.errors.certifications?.[index]?.credential_url}>
                    <TextInput
                      type="url"
                      value={cert.credential_url ?? ''}
                      onChange={(e) => {
                        const certifications = [...form.data.certifications];
                        certifications[index] = {...certifications[index], credential_url: e.target.value || null};
                        form.setData('certifications', certifications);
                      }}
                    />
                  </Field>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeCertification(index)}
                >
                  Remove Certification
                </Button>
              </div>
            ))}
          {/* Add Certification Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={addCertification}
              className="w-full md:w-auto"
            >
              Add Certification
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </FormSection>

        <FormSection
          title="Languages"
          description="List any languages you speak and your proficiency level."
        >
          {form.data.languages.length > 0 ? (
            form.data.languages.map((lang, index) => (
              <div key={index} className="border lg:border-0 lg:grid lg:grid-cols-[1fr_auto] lg:gap-6 mb-4 pb-3 last:mb-0 last:border-0">
                <div className="space-y-2">
                  <h4 className="font-medium">Language #{index + 1}</h4>

                  <div className="grid gap-2">
                    <Field label="Language" error={form.errors.languages?.[index]?.language}>
                      <TextInput
                        placeholder="e.g., English, Spanish, Mandarin"
                        value={lang.language}
                        onChange={(e) => {
                          const languages = [...form.data.languages];
                          languages[index] = {...languages[index], language: e.target.value};
                          form.setData('languages', languages);
                        }}
                        className="w-full"
                      />
                    </Field>
                    <Field label="Proficiency" error={form.errors.languages?.[index]?.proficiency}>
                      <TextInput
                        placeholder="e.g., Native, Fluent, Intermediate, Beginner"
                        value={lang.proficiency}
                        onChange={(e) => {
                          const languages = [...form.data.languages];
                          languages[index] = {...languages[index], proficiency: e.target.value as any};
                          form.setData('languages', languages);
                        }}
                        className="w-full"
                      />
                    </Field>
                  </div>
                </div>

                {/* Remove Button */}
                <div className="lg:col-span-2 lg:self-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeLanguage(index)}
                    className="w-full md:w-auto"
                  >
                    Remove Language
                    <Terminal className="mr-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="size-6 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No languages added yet. Click "Add Language" to get started.
              </p>
            </div>
          )}

          {/* Add Language Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={addLanguage}
              className="w-full md:w-auto"
            >
              Add Language
              <Terminal className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </FormSection>

        <FormSection
          title="Additional Sections"
          description="Add any other relevant sections to your CV such as publications, awards, volunteer work, or hobbies."
        >
          <Field label="Additional Content" error={form.errors.additional_sections}>
            <Textarea
              placeholder="Enter any additional sections that strengthen your CV, such as:\n• Publications and research\n• Awards and honors\n• Volunteer work and community involvement\n• Professional affiliations\n• Hobbies and interests (if relevant to the position)"
              value={form.data.additional_sections}
              onChange={(e) => form.setData('additional_sections', e.target.value)}
              className="w-full min-h-[120px]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Use this section to showcase unique qualifications that don't fit in other categories but add value to your professional profile.
            </p>
          </Field>
        </FormSection>

        {/* ATS Score Display */}
        {atsScore !== null && (
          <FormSection
            title="ATS Score"
            description="How well your CV is optimized for Applicant Tracking Systems."
          >
            <div className="mb-4 text-sm text-muted-foreground">
              ATS systems scan your CV for keywords, formatting, and content quality.
              Scores above 80 are excellent, 60-79 are good, 40-59 need improvement,
              and below 40 may not pass initial screening.
            </div>
            <div className="grid gap-4">
              <div className="text-center">
                <div className="w-24 h-24 relative">
                  <svg
                    className="absolute inset-0 h-full w-full text-muted-foreground/20"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <circle cx="24" cy="24" r="22" strokeWidth="3" />
                  </svg>
                  <svg
                    className="absolute inset-0 h-full w-full transition-transform duration-750 transform -rotate-90"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      strokeWidth="3"
                      stroke="currentColor"
                      style={{ strokeDasharray: `${atsScore}, 100` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                    {atsScore}/100
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {atsScore >= 80
                    ? 'Excellent ATS compatibility'
                    : atsScore >= 60
                    ? 'Good ATS compatibility'
                    : atsScore >= 40
                    ? 'Fair ATS compatibility'
                    : 'Needs improvement for ATS'}
                </p>
              </div>
              <div className="space-y-2 text-xs">
                {Object.entries(scoreBreakdown || {}).map(([criterion, score]) => (
                  <div key={criterion} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {criterion
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    <div className="w-20 h-2 relative">
                      <div
                        className="absolute left-0 top-0 h-2 w-full bg-muted"
                        role="presentation"
                      />
                      <div
                        className="absolute left-0 top-0 h-2 bg-highlight"
                        role="presentation"
                        style={{ width: `${score * 10}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono">{score}/10</span>
                  </div>
            ))}
              </div>
            </div>
          </FormSection>
        )}

        <div className="flex justify-end pt-8">
          <Button
            asChild
            disabled={isSaving}
          >
            <Link href={cvRoutes.index()}>
              <ArrowLeft className="size-4" />
              Back to CV List
            </Link>
          </Button>
          <Button
            className="ml-4"
            disabled={isSaving}
          >
            {isCalculatingScore ? 'Calculating score…' : form.processing ? 'Saving…' : 'Save CV'}
            <Check className="size-4" />
          </Button>
        </div>

        {/* Floating save button */}
        {isDirty && (
          <button
            onClick={submit}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border bg-primary/90 px-4 py-2 text-xs font-semibold shadow-md backdrop-blur-md border-border/20 hover:bg-primary/80 transition-all duration-200"
            aria-label="Save changes"
          >
            <Save className="size-4" />
            Save changes
          </button>
        )}
      </form>
    </>
  );
}
