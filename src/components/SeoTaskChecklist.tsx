import { useState } from 'react';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type { Resort, SeoAgentOutput, SeoChecklistCategory } from '../types/resort';
import {
  buildWidgetEntranceTransition,
  DASHBOARD_VIEWPORT_CONFIG,
  PREMIUM_EASE,
  SUBTLE_ENTRANCE_INITIAL,
  SUBTLE_ENTRANCE_VISIBLE,
} from '../utils/motionPresets';
import {
  evaluateSeoChecklist,
  type SeoChecklistManualOverrides,
} from '../utils/seoChecklist';

interface SeoTaskChecklistProps {
  resort: Resort;
  seoOutput: SeoAgentOutput;
  hasOptimizedMeta: boolean;
  manualOverrides: SeoChecklistManualOverrides;
  onCompleteMetaTask: () => void;
  onSaveAltText: (altText: string) => void;
  onToggleSchemaTask: () => void;
  onJumpToListingEditor: () => void;
}

export function SeoTaskChecklist({
  resort,
  seoOutput,
  hasOptimizedMeta,
  manualOverrides,
  onCompleteMetaTask,
  onSaveAltText,
  onToggleSchemaTask,
  onJumpToListingEditor,
}: SeoTaskChecklistProps) {
  const [altDraft, setAltDraft] = useState(
    resort.imageAltText ||
      `${resort.name} in ${resort.location}, Wayanad near ${resort.landmarkDistance}`
  );
  const [editingAlt, setEditingAlt] = useState(false);

  const progress = evaluateSeoChecklist(
    resort,
    seoOutput,
    hasOptimizedMeta,
    manualOverrides
  );

  const handleTaskAction = (id: SeoChecklistCategory) => {
    if (id === 'meta_tags') {
      onCompleteMetaTask();
    } else if (id === 'image_alt') {
      setEditingAlt((prev) => !prev);
    } else if (id === 'schema') {
      onToggleSchemaTask();
    } else {
      onJumpToListingEditor();
    }
  };

  return (
    <motion.section
      aria-labelledby="seo-task-checklist-heading"
      data-testid="seo-task-checklist"
      initial={SUBTLE_ENTRANCE_INITIAL}
      whileInView={SUBTLE_ENTRANCE_VISIBLE}
      viewport={DASHBOARD_VIEWPORT_CONFIG}
      transition={buildWidgetEntranceTransition(1)}
      className="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2
            id="seo-task-checklist-heading"
            className="text-lg font-bold text-slate-900"
          >
            SEO Task Checklist
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {progress.completedCount === progress.totalCount
              ? 'All profile SEO tasks completed — your listing is ready for top Google rankings.'
              : 'Complete meta-tags, image alt-text, and schema steps to unlock higher search visibility.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 tabular-nums">
          <span
            data-testid="seo-checklist-progress-label"
            className="text-xs font-bold text-emerald-900"
          >
            {progress.completedCount} of {progress.totalCount} completed ({progress.percent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="SEO setup completion"
      >
        <motion.div
          className="h-full w-full rounded-full bg-emerald-800"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress.percent / 100 }}
          transition={{ duration: 0.45, ease: PREMIUM_EASE }}
          style={{ transformOrigin: 'left' }}
        />
      </div>

      {/* Checklist Rows */}
      <ul className="mt-5 divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/40">
        {progress.tasks.map((task) => (
          <li key={task.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {task.completed ? (
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle
                    className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      task.completed ? 'text-slate-900' : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 break-words">
                    {task.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTaskAction(task.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  task.completed
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {task.id === 'image_alt' && task.completed
                  ? 'Edit Alt-Text'
                  : task.actionLabel}
              </button>
            </div>

            {/* Inline Image Alt-Text Editor */}
            {task.id === 'image_alt' && editingAlt && (
              <div className="mt-3 pl-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label htmlFor="checklist-alt-input" className="sr-only">
                  Primary resort image alt-text
                </label>
                <input
                  id="checklist-alt-input"
                  type="text"
                  value={altDraft}
                  onChange={(e) => setAltDraft(e.target.value)}
                  placeholder="Describe resort view, location & key amenity..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-emerald-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    onSaveAltText(altDraft.trim());
                    setEditingAlt(false);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Save Alt-Text</span>
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
